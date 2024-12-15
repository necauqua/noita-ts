use std::fmt::Display;

use crate::parsing::StringExt;

#[derive(Debug)]
pub struct Component {
    pub name: String,
    pub fields: Vec<ComponentField>,
}

#[derive(Debug)]
pub struct ComponentField {
    pub category: Category,
    pub ty: String,
    pub name: String,
    pub hints: String,
    pub doc: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Category {
    Member,
    CustomDataType,
    Private,
    Object,
}

impl Display for Category {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        use Category as E;
        match self {
            E::Member => write!(f, "Member"),
            E::CustomDataType => write!(f, "Custom Data Type"),
            E::Private => write!(f, "Private"),
            E::Object => write!(f, "Object"),
        }
    }
}

#[derive(Debug)]
pub struct ComponentError {
    pub component: String,
    pub line_number: usize,
    pub line: String,
}

impl ComponentError {
    pub fn new(component: &Option<String>, line_number: usize, line: &str) -> Self {
        Self {
            component: component.as_deref().unwrap_or_default().to_owned(),
            line_number,
            line: line.to_owned(),
        }
    }
}

pub fn parse_components(input: &str) -> (Vec<Component>, Vec<ComponentError>) {
    let mut result = Vec::new();
    let mut errors = Vec::new();

    let mut name = None;
    let mut fields = Vec::new();
    let mut category = Category::Member;

    for (i, line) in input.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        if !line.starts_with(' ') {
            if let Some(name) = name.take() {
                result.push(Component {
                    name,
                    fields: std::mem::take(&mut fields),
                })
            }
            name = Some(line.trim().to_owned());
            continue;
        }
        let line = line.trim();
        if let Some(cat) = line.strip_prefix('-') {
            category = match cat.trim().trim_end_matches('-').trim_end() {
                "Members" => Category::Member,
                "Custom data types" => Category::CustomDataType,
                "Privates" => Category::Private,
                "Objects" => Category::Object,
                cat => {
                    tracing::warn!("Unknown category: `{cat}`");
                    Category::Member
                }
            };
            continue;
        }

        let Some((ty, rest)) = split_type(line) else {
            errors.push(ComponentError::new(&name, i + 1, line));
            continue;
        };
        let Some((field_name, rest)) = rest.trim().split_once(' ') else {
            errors.push(ComponentError::new(&name, i + 1, line));
            continue;
        };
        let Some((hints, doc)) = rest.trim().split_once('"') else {
            errors.push(ComponentError::new(&name, i + 1, line));
            continue;
        };

        fields.push(ComponentField {
            category,
            ty: ty.to_owned(),
            name: field_name.to_owned(),
            hints: hints.trim().to_owned(),
            doc: doc.strip_suffix('"').unwrap_or(doc).to_owned(),
        });
    }

    (result, errors)
}

/// A collection of cringetastic workarounds for the types that overflow their
/// table cells and since there's apparently no minimal size for separators
/// they get mushed with the name.
///
/// Heuristic-ish algorithms here:
///  - Handle the unsigned types because ofc they have a space in them
///  - If the type is a pointer we split on the star
///  - If the type is an enum we split on the "::Enum" part
///  - Else all types seem to be SCREAMING_CASE so we split on `[A-Z]{4}[a-z]`
///    regex basically (4 because of IKLimbAttackerState)
///  - And then we have the happy path of splitting on space
fn split_type(s: &str) -> Option<(String, &str)> {
    if let Some(rest) = s.strip_prefix("unsigned ") {
        return split_type(rest).map(|(ty, rest)| (format!("unsigned {ty}"), rest));
    }

    if let Some((ty, rest)) = s.rsplit_once('*') {
        if !ty.contains(' ') && !rest.starts_with(' ') {
            // include the * back
            let ty = &s[..ty.len() + 1];
            return Some((ty.to_owned(), rest));
        }
    }
    if let Some((ty, rest)) = s.split_once("::Enum") {
        if !ty.contains(' ') && !rest.starts_with(' ') {
            let ty = &s[..ty.len() + 6];
            return Some((ty.to_owned(), rest));
        }
    }
    let pat = {
        let mut prev_chars = ['\0'; 4];

        move |ch: char| {
            let res =
                prev_chars.iter().all(|ch| ch.is_ascii_uppercase()) && ch.is_ascii_lowercase();
            prev_chars = [prev_chars[1], prev_chars[2], prev_chars[3], ch];
            res
        }
    };
    if let Some((ty, rest)) = s.split_once(pat) {
        if !ty.contains(' ') && !rest.starts_with(' ') {
            let rest = &s[ty.len()..];
            return Some((ty.to_owned(), rest));
        }
    }

    s.split_balanced(' ').into_iter().next().map(|ty| {
        let rest = &s[ty.len()..];
        let ty = ty.replace(' ', ""); // remove inconsistent spaces in vector types
        (ty, rest)
    })
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use super::*;

    #[test]
    fn snapshot_field_types() {
        crate::init_logging().unwrap();

        let input = include_str!("../component_documentation.txt");

        let (components, errors) = parse_components(input);
        assert!(errors.is_empty());

        let mut types = components
            .iter()
            .flat_map(|c| c.fields.iter())
            .map(|f| &f.ty)
            .collect::<HashSet<_>>()
            .into_iter()
            .collect::<Vec<_>>();
        types.sort();

        insta::assert_debug_snapshot!(types, @r#"
        [
            "AIData*",
            "AI_STATE_STACK",
            "ARC_TYPE::Enum",
            "AudioSourceHandle",
            "Biome*",
            "CharacterStatsModifier",
            "ComponentTags",
            "ConfigDamageCritical",
            "ConfigDamagesByType",
            "ConfigDrugFx",
            "ConfigExplosion",
            "ConfigGun",
            "ConfigGunActionInfo",
            "ConfigLaser",
            "DAMAGE_TYPES::Enum",
            "ENTITY_VEC",
            "EXPLOSION_TRIGGER_TYPE::Enum",
            "Entity*",
            "EntityID",
            "EntityTags",
            "EntityTypeID",
            "FloatArrayInline",
            "GAME_EFFECT::Enum",
            "HIT_EFFECT::Enum",
            "IKLimbAttackerState",
            "IKLimbStateVec",
            "INVENTORYITEM_VECTOR",
            "INVENTORY_KIND::Enum",
            "ImGuiContext*",
            "InvenentoryUpdateListener*",
            "JOINT_TYPE::Enum",
            "LUA_VM_TYPE::Enum",
            "LensValue<bool>",
            "LensValue<float>",
            "LensValue<int>",
            "LuaManager*",
            "MAP_STRING_STRING",
            "MATERIAL_VEC_DOUBLES",
            "MOVETOSURFACE_TYPE::Enum",
            "MSG_QUEUE_PATH_FINDING_RESULT",
            "NINJA_ROPE_SEGMENT_VECTOR",
            "PARTICLE_EMITTER_CUSTOM_STYLE::Enum",
            "PROJECTILE_TYPE::Enum",
            "ParticleEmitter_Animation*",
            "PathFindingComponentState::Enum",
            "PathFindingInput",
            "PathFindingLogic*",
            "PathFindingNodeHandle",
            "PathFindingResultNode",
            "PixelSprite*",
            "ProjectileTriggers",
            "RAGDOLL_FX::Enum",
            "RtsUnitGoal",
            "STACK_ANIMATIONSTATE",
            "SpriteRenderList*",
            "SpriteStains*",
            "SpriteStainsState",
            "StatusEffectType",
            "TeleportComponentState::Enum",
            "USTRING",
            "UintArrayInline",
            "VECTOR_ENTITYID",
            "VECTOR_FLOAT",
            "VECTOR_INT",
            "VECTOR_INT32",
            "VECTOR_JUMPPARAMS",
            "VECTOR_PATHNODE",
            "VECTOR_STR",
            "VECTOR_STRING",
            "VEC_CUTTHROUGHWORLD",
            "VEC_ENTITY",
            "VEC_NPCPARTY",
            "VEC_OF_MATERIALS",
            "VEC_PENDINGPORTAL",
            "VERLET_TYPE::Enum",
            "VISITED_VEC",
            "ValueMap",
            "ValueRange",
            "ValueRangeInt",
            "Vec2ArrayInline",
            "VerletLinkArrayInline",
            "VerletSprite*",
            "VirtualTextureHandle",
            "WormPartPositions",
            "as::Sprite*",
            "b2Body*",
            "b2Joint*",
            "b2ObjectID",
            "b2Vec2",
            "b2WeldJoint*",
            "bool",
            "double",
            "float",
            "float*",
            "grid::ICell*",
            "int",
            "int16",
            "int32",
            "int64",
            "ivec2",
            "std::set<int32>",
            "std::string",
            "std::vector<b2Body*>*",
            "std::vector<float>",
            "std::vector<int>",
            "std_string",
            "types::aabb",
            "types::fcolor",
            "types::iaabb",
            "types::xform",
            "uint16",
            "uint32",
            "uint32_t",
            "uint64",
            "unsigned int",
            "vec2",
        ]
        "#);
    }
}
