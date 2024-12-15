/** !Auto-generated! */

declare type ComponentShapes = {
    AIAttackComponent: {
        /**
         * The probability for using this attack if it's otherwise possible
         * - Hints: 100 [0, 100]
         */
        use_probability: number,
        /**
         * The minimum distance from enemy at which we can perform this attack.
         * - Hints: 10 [0, 10000]
         */
        min_distance: number,
        /**
         * The maximum distance from enemy at which we can perform this attack.
         * - Hints: 160 [0, 10000]
         */
        max_distance: number,
        /**
         * When looking for threats/prey this is our field of view around the X axis. 90 means we scan the whole 180 degrees around the X axis, to the left and right.
         * - Hints: 90 [0, 90]
         */
        angular_range_deg: number,
        /**
         * How long do we stay in the attack state, before other states are allowed?
         * - Hints: 45 [0, 1000]
         */
        state_duration_frames: number,
        /**
         * The minimum number of frames we wait between these attacks
         * - Hints: 180 [0, 1000]
         */
        frames_between: number,
        /**
         * The minimum number of frames we wait after this attack before doing any other ranged attack
         * - Hints: 30 [0, 1000]
         */
        frames_between_global: number,
        /**
         * The animation to play when performing this attack
         * - Hints: attack_ranged [0, 1]
         */
        animation_name: string,
        /**
         * If 1, we try to land before doing the attack, if there's ground near nearby under us
         * - Hints: 0 [0, 1]
         */
        attack_landing_ranged_enabled: boolean,
        /**
         * The frame of the 'attack_ranged' animation during which the ranged attack actually occurs
         * - Hints: 2 [0, 1000]
         */
        attack_ranged_action_frame: number,
        /**
         * 'attack_ranged_entity_file' is created here when performing a ranged attack
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_offset_x: number,
        /**
         * 'attack_ranged_entity_file' is created here when performing a ranged attack
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_offset_y: number,
        /**
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_root_offset_x: number,
        /**
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_root_offset_y: number,
        /**
         * If 1, we do ranged attacks by sending a Message_UseItem
         * - Hints: 0 [0, 1]
         */
        attack_ranged_use_message: boolean,
        /**
         * If 1, we attempt to predict target movement and shoot accordingly
         * - Hints: 0 [0, 1]
         */
        attack_ranged_predict: boolean,
        /**
         * File to projectile entity that is created when performing a ranged attack
         * - Hints: data/entities/projectiles/spear.xml [0, 1]
         */
        attack_ranged_entity_file: string,
        /**
         * Minimum number of projectiles shot when performing a ranged attack
         * - Hints: 1 [0, 1000]
         */
        attack_ranged_entity_count_min: number,
        /**
         * Maximum number of projectiles shot when performing a ranged attack
         * - Hints: 1 [0, 1000]
         */
        attack_ranged_entity_count_max: number,
        /**
         * If 1, we draw a laser sight to our target. Requires entity to have a sprite with tag 'laser_sight'
         * - Hints: 0 [0, 1]
         */
        attack_ranged_use_laser_sight: boolean,
        /**
         * If 1, we use a laser sight
         * - Hints: 0 [0, 1]
         */
        attack_ranged_aim_rotation_enabled: boolean,
        /**
         * How fast can we rotate our aim to track targets
         * - Hints: 3 [0, 1]
         */
        attack_ranged_aim_rotation_speed: number,
        /**
         * If our aim is closer than this to the target we shoot
         * - Hints: 10 [0, 1]
         */
        attack_ranged_aim_rotation_shooting_ok_angle_deg: number,
        /**
         * which direction does our gun currently point at, physically saying?
         * - Hints: 0 [0, 1]
         */
        mRangedAttackCurrentAimAngle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrameUsable: number,
    };
    AIComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
        /**
         */
        data: ComponentTypeMap['AIData*'],
    };
    AbilityComponent: {
        /**
         * - Hints: 0 [0, 60000]
         */
        cooldown_frames: number,
        /**
         * the projectile entity file
         */
        entity_file: string,
        /**
         */
        sprite_file: string,
        /**
         * - Hints: 1 [0, 60000]
         */
        entity_count: number,
        /**
         * - Hints: 0 [0, 1]
         */
        never_reload: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        reload_time_frames: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mana: number,
        /**
         * - Hints: 100 [0, 1]
         */
        mana_max: number,
        /**
         * - Hints: 10 [0, 1]
         */
        mana_charge_speed: number,
        /**
         * - Hints: 1 [0, 1]
         */
        rotate_in_hand: boolean,
        /**
         * [0-1], how much does the item rotate related to the actual aiming angle
         * - Hints: 1 [0, 1]
         */
        rotate_in_hand_amount: number,
        /**
         * [0-1], how much does hand sprite rotate related to the actual aiming angle
         * - Hints: 0.7 [0, 1]
         */
        rotate_hand_amount: number,
        /**
         * if 1, then the velocity of the bullet is increased quite a bit. Lightning requires this
         * - Hints: 0 [0, 1]
         */
        fast_projectile: boolean,
        /**
         * - Hints: 0 [-1000, 1000]
         */
        swim_propel_amount: number,
        /**
         * - Hints: 0 [0, 1]
         */
        max_charged_actions: number,
        /**
         * - Hints: 10 [0, 1]
         */
        charge_wait_frames: number,
        /**
         * How quickly does the item return to resting state after getting recoil
         * - Hints: 15 [0, 1]
         */
        item_recoil_recovery_speed: number,
        /**
         * Maximum distance moved by recoil
         * - Hints: 1 [0, 1]
         */
        item_recoil_max: number,
        /**
         * Item distance moved by recoil = mItemRecoil * item_recoil_offset_coeff
         * - Hints: 1 [0, 1]
         */
        item_recoil_offset_coeff: number,
        /**
         * Item rotation by recoil = mItemRecoil * item_recoil_rotation_coeff
         * - Hints: 5 [0, 1]
         */
        item_recoil_rotation_coeff: number,
        /**
         * when dropping / throwing the item, this is the base_item that we add the ability component to
         * - Hints: data/entities/base_item.xml [0, 1]
         */
        base_item_file: string,
        /**
         * - Hints: 0 [0, 1]
         */
        use_entity_file_as_projectile_info_proxy: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        click_to_use: boolean,
        /**
         * used to track how many times player has shot this 'ability'
         * - Hints: 0 [0, 1]
         */
        stat_times_player_has_shot: number,
        /**
         * used to track how many times this has been edited
         * - Hints: 0 [0, 1]
         */
        stat_times_player_has_edited: number,
        /**
         * - Hints: 0 [0, 1]
         */
        shooting_reduces_amount_in_inventory: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        throw_as_item: boolean,
        /**
         * If 1, the item will be work as normal ability, but throwing animation is played by the user
         * - Hints: 0 [0, 1]
         */
        simulate_throw_as_item: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        max_amount_in_inventory: number,
        /**
         * - Hints: 1 [0, 1]
         */
        amount_in_inventory: number,
        /**
         * - Hints: 1 [0, 1]
         */
        drop_as_item_on_death: boolean,
        /**
         * way to name the weapons
         * - Hints: [NOT_SET] [0, 1]
         */
        ui_name: string,
        /**
         * If 1, the default ability behaviour is replaced with one that uses the lua gun system.
         * - Hints: 0 [0, 1]
         */
        use_gun_script: boolean,
        /**
         * if 1, TODO( PETRI)
         * - Hints: 0 [0, 1]
         */
        is_petris_gun: boolean,
        /**
         * the level of the wand, set in gun_procedural.lua
         * - Hints: 1 [1, 10]
         */
        gun_level: number,
        /**
         * e.g. 'bullet,bullet,damage' ... actions are parsed into a string. These are added as actual entities when the item is initialized
         */
        add_these_child_actions: string,
        /**
         * After this many slots the last slot of the gun is removed. -1 means not initialized/infinite.
         * - Hints: -1 [0, 1]
         */
        current_slot_durability: number,
        /**
         * Name of the lua function in 'gun.lua' that is called to calculate durability of the last slot in the gun
         * - Hints: _get_gun_slot_durability_default [0, 1]
         */
        slot_consumption_function: ComponentTypeMap['std_string'],
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mNextFrameUsable: number,
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mCastDelayStartFrame: number,
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mReloadFramesLeft: number,
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mReloadNextFrameUsable: number,
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mChargeCount: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mIsInitialized: boolean,
        /**
         * Constants for gun script
         */
        gun_config: ComponentTypeMap['ConfigGun'],
        /**
         * Constants for gun script
         */
        gunaction_config: ComponentTypeMap['ConfigGunActionInfo'],
        /**
         * - Hints: 0 [0, 1]
         */
        mAmmoLeft: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextChargeFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mItemRecoil: number,
    };
    AdvancedFishAIComponent: {
        /**
         * - Hints: 16 [0, 2]
         */
        move_check_range_min: number,
        /**
         * - Hints: 64 [0, 2]
         */
        move_check_range_max: number,
        /**
         * - Hints: 1 [0, 1]
         */
        flock: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        avoid_predators: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mHasTargetDirection: boolean,
        /**
         */
        mTargetPos: ComponentTypeMap['vec2'],
        /**
         */
        mTargetVec: ComponentTypeMap['vec2'],
        /**
         */
        mLastFramesMovementAreaMin: ComponentTypeMap['vec2'],
        /**
         */
        mLastFramesMovementAreaMax: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNumFailedTargetSearches: ComponentTypeMap['uint32'],
        /**
         * - Hints: -1 [0, 1]
         */
        mNextFrameCheckAreWeStuck: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mNextFrameCheckFlockWants: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mNextFramePredatorAvoidance: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mScared: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mWantsToBeInFlock: boolean,
    };
    AltarComponent: {
        /**
         */
        recognized_entity_tags: string,
        /**
         * - Hints: 3 [0, 1]
         */
        uses_remaining: number,
        /**
         * String name of material for particles emitted on successful sacrifice
         * - Hints: 0 [0, 1]
         */
        good_fx_material: number,
        /**
         * String name of material for particles emitted on successful sacrifice
         * - Hints: 0 [0, 1]
         */
        neutral_fx_material: number,
        /**
         * String name of material for particles emitted on successful sacrifice
         * - Hints: 0 [0, 1]
         */
        evil_fx_material: number,
        /**
         */
        m_recognized_entity_tags: ComponentTypeMap['EntityTags'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_recognized_entity_tags_count: ComponentTypeMap['uint32'],
        /**
         */
        m_current_entity_tags: ComponentTypeMap['EntityTags'],
    };
    AnimalAIComponent: {
        /**
         * Current state of ai, defines what the animal is doing
         * - Hints: 0 [0, 20]
         */
        ai_state: number,
        /**
         * If not 0, then we wait till this frame to pop current state from our state stack
         * - Hints: 0 [0, 1000]
         */
        ai_state_timer: number,
        /**
         * if 1, will ensure state timer keeps current state alive for a while when Component is Enabled
         * - Hints: 0 [0, 1]
         */
        keep_state_alive_when_enabled: boolean,
        /**
         * We always do this job, unless interrupted (i.e. by taking fire damage)
         */
        preferred_job: string,
        /**
         * the chance of escaping if someone damages us. only works if 'can_fly = 0 '
         * - Hints: 30 [0, 1]
         */
        escape_if_damaged_probability: number,
        /**
         * the chance of counter-attacking if someone damages us, and we didn't escape
         * - Hints: 100 [0, 1]
         */
        attack_if_damaged_probability: number,
        /**
         * We cast rays from our position + eye_offset to check if we can see something
         * - Hints: 0 [-100, 100]
         */
        eye_offset_x: number,
        /**
         * We cast rays from our position + eye_offset to check if we can see something
         * - Hints: 0 [-100, 100]
         */
        eye_offset_y: number,
        /**
         * If 1, we never attack anyone unless attacked before by someone
         * - Hints: 0 [0, 1]
         */
        attack_only_if_attacked: boolean,
        /**
         * If 1, we don't attack members of our herd even if they accidentally attack us
         * - Hints: 0 [0, 1]
         */
        dont_counter_attack_own_herd: boolean,
        /**
         * When looking for threats/prey this is the max distance from us on the X axis we scan
         * - Hints: 50 [0, 2000]
         */
        creature_detection_range_x: number,
        /**
         * When looking for threats/prey this is the max distance from us on the Y axis we scan
         * - Hints: 20 [0, 2000]
         */
        creature_detection_range_y: number,
        /**
         * When looking for threats/prey this is our field of view around the X axis. 90 means we scan the whole 180 degrees around the X axis, to the left and right
         * - Hints: 90 [0, 90]
         */
        creature_detection_angular_range_deg: number,
        /**
         * Checks for threats/prey take place at least this many frames apart from each other
         * - Hints: 120 [0, 5000]
         */
        creature_detection_check_every_x_frames: number,
        /**
         * JobDefault idles before we've been once at least this close to the camera
         * - Hints: 300 [0, 2000]
         */
        max_distance_to_cam_to_start_hunting: number,
        /**
         * The maximum depth (in nodes) path search use when we have not found prey yet
         * - Hints: 50 [0, 5000]
         */
        pathfinding_max_depth_no_target: number,
        /**
         * The maximum depth (in nodes) path search use when we have found prey
         * - Hints: 120 [0, 5000]
         */
        pathfinding_max_depth_has_target: number,
        /**
         * what's the initial random aggressiveness of this creature
         * - Hints: 80 [0, 100]
         */
        aggressiveness_min: number,
        /**
         * what's the initial random aggressiveness of this creature
         * - Hints: 100 [0, 100]
         */
        aggressiveness_max: number,
        /**
         * if 1, the AI tries to attack whoever it considers a friend based on herd_ids, CHARMED and BERSERK status etc. useful e.g. for healers.
         * - Hints: 0 [0, 1]
         */
        tries_to_ranged_attack_friends: boolean,
        /**
         * If 1, and melee attack has been configured, we can perform melee attacks
         * - Hints: 1 [0, 1]
         */
        attack_melee_enabled: boolean,
        /**
         * If 1, and dash attack has been configured, we can perform dash attacks (a long-distance melee attack where we dash towards the enemy)
         * - Hints: 0 [0, 1]
         */
        attack_dash_enabled: boolean,
        /**
         * If 1, and ranged attack has been configured, we can perform ranged attacks
         * - Hints: 0 [0, 1]
         */
        attack_landing_ranged_enabled: boolean,
        /**
         * If 1, and ranged attack has been configured, we can perform ranged attacks
         * - Hints: 0 [0, 1]
         */
        attack_ranged_enabled: boolean,
        /**
         * If not 0, melee and dash attacks cause knockback to target
         * - Hints: 100 [-100, 100]
         */
        attack_knockback_multiplier: number,
        /**
         * If 1, we can only attack in one fixed direction
         * - Hints: 0 [0, 1]
         */
        is_static_turret: boolean,
        /**
         * Maximum distance at which we can perform a melee attack
         * - Hints: 20 [0, 400]
         */
        attack_melee_max_distance: number,
        /**
         * The animation frame during which the melee attack damage is inflicted and visual effects are created
         * - Hints: 2 [0, 1000]
         */
        attack_melee_action_frame: number,
        /**
         * The minimum number of frames we wait between melee attacks
         * - Hints: 10 [0, 1000]
         */
        attack_melee_frames_between: number,
        /**
         * Melee attack damage inclusive minimum amount. The damage is randomized between melee attack_damage_min and attack_melee_damage_max
         * - Hints: 0.4 [0, 100]
         */
        attack_melee_damage_min: number,
        /**
         * Melee attack damage inclusive maximum amount. The damage is randomized between melee attack_damage_min and attack_melee_damage_max
         * - Hints: 0.6 [0, 100]
         */
        attack_melee_damage_max: number,
        /**
         * The x component of the impulse that is applied to damaged entities
         * - Hints: 0 [-100, 100]
         */
        attack_melee_impulse_vector_x: number,
        /**
         * The y component of the impulse that is applied to damaged entities
         * - Hints: 0 [-100, 100]
         */
        attack_melee_impulse_vector_y: number,
        /**
         * A multiplier applied to attack_melee_impulse
         * - Hints: 0 [-100, 100]
         */
        attack_melee_impulse_multiplier: number,
        /**
         * Melee attack particle effects are created here
         * - Hints: 0 [-1000, 1000]
         */
        attack_melee_offset_x: number,
        /**
         * Melee attack particle effects are created here
         * - Hints: 0 [-1000, 1000]
         */
        attack_melee_offset_y: number,
        /**
         * If 1, we perform a finishing move when our attack would kill the target using the 'attack_finish' animation
         * - Hints: 0 [0, 1]
         */
        attack_melee_finish_enabled: boolean,
        /**
         * The animation frame during which the melee attack finishing move damage is inflicted and visual effects are created
         * - Hints: 2 [0, 1000]
         */
        attack_melee_finish_action_frame: number,
        /**
         * The maximum distance from enemy at which we can perform a dash attack. If a normal melee attack is possible we always do that instead
         * - Hints: 50 [0, 10000]
         */
        attack_dash_distance: number,
        /**
         * The minimum number of frames we wait between dash attacks
         * - Hints: 120 [0, 1200]
         */
        attack_dash_frames_between: number,
        /**
         * The amount of damage inflicted by the dash attack
         * - Hints: 0.25 [0, 20]
         */
        attack_dash_damage: number,
        /**
         * The speed at which we dash
         * - Hints: 200 [0, 5000]
         */
        attack_dash_speed: number,
        /**
         * The smaller this value is the more curved our dash attack trajectory is
         * - Hints: 0.9 [0, 6]
         */
        attack_dash_lob: number,
        /**
         * The minimum distance from enemy at which we can perform a ranged attack.
         * - Hints: 10 [0, 10000]
         */
        attack_ranged_min_distance: number,
        /**
         * The maximum distance from enemy at which we can perform a ranged attack.
         * - Hints: 160 [0, 10000]
         */
        attack_ranged_max_distance: number,
        /**
         * The frame of the 'attack_ranged' animation during which the ranged attack actually occurs
         * - Hints: 2 [0, 1000]
         */
        attack_ranged_action_frame: number,
        /**
         * 'attack_ranged_entity_file' is created here when performing a ranged attack
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_offset_x: number,
        /**
         * 'attack_ranged_entity_file' is created here when performing a ranged attack
         * - Hints: 0 [-1000, 1000]
         */
        attack_ranged_offset_y: number,
        /**
         * If 1, we do ranged attacks by sending a Message_UseItem
         * - Hints: 0 [0, 1]
         */
        attack_ranged_use_message: boolean,
        /**
         * If 1, we attempt to predict target movement and shoot accordingly
         * - Hints: 0 [0, 1]
         */
        attack_ranged_predict: boolean,
        /**
         * File to projectile entity that is created when performing a ranged attack
         * - Hints: data/entities/projectiles/spear.xml [0, 1]
         */
        attack_ranged_entity_file: string,
        /**
         * Minimum number of projectiles shot when performing a ranged attack
         * - Hints: 1 [0, 1000]
         */
        attack_ranged_entity_count_min: number,
        /**
         * Maximum number of projectiles shot when performing a ranged attack
         * - Hints: 1 [0, 1000]
         */
        attack_ranged_entity_count_max: number,
        /**
         * If 1, we draw a laser sight to our target. Requires entity to have a sprite with tag 'laser_sight'
         * - Hints: 0 [0, 1]
         */
        attack_ranged_use_laser_sight: boolean,
        /**
         * 0 = red, 1 = blue 
         * - Hints: 0 [0, 1]
         */
        attack_ranged_laser_sight_beam_kind: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        attack_ranged_aim_rotation_enabled: boolean,
        /**
         * - Hints: 3 [0, 1]
         */
        attack_ranged_aim_rotation_speed: number,
        /**
         * - Hints: 10 [0, 1]
         */
        attack_ranged_aim_rotation_shooting_ok_angle_deg: number,
        /**
         * How long do we stay in the attack state, before other states are allowed?
         * - Hints: 45 [0, 1000]
         */
        attack_ranged_state_duration_frames: number,
        /**
         * If 1, we attempt to hide from our target after a succesful attack
         * - Hints: 0 [0, 1]
         */
        hide_from_prey: boolean,
        /**
         * The minimum distance from our target where we should move when hiding
         * - Hints: 200 [0, 10000]
         */
        hide_from_prey_target_distance: number,
        /**
         * The number of frames we spend hiding and staying hiding
         * - Hints: 300 [0, 1]
         */
        hide_from_prey_time: number,
        /**
         * If 1, we replace eaten cells with particles made of this material
         * - Hints: 1 [0, 1]
         */
        food_eating_create_particles: boolean,
        /**
         * 1/2 width of the area from which we eat food
         * - Hints: 3 [-100, 100]
         */
        eating_area_radius_x: number,
        /**
         * 1/2 height of the area from which we eat food
         * - Hints: 8 [-100, 100]
         */
        eating_area_radius_y: number,
        /**
         * The center of the area from which we eat food
         * - Hints: 0 [-100, 100]
         */
        mouth_offset_x: number,
        /**
         * The center of the area from which we eat food
         * - Hints: 0 [-100, 100]
         */
        mouth_offset_y: number,
        /**
         * If 1, we occasionally take a leak or a dump
         * - Hints: 0 [0, 1]
         */
        defecates_and_pees: boolean,
        /**
         * Bodily wastes are created here
         * - Hints: 0 [-100, 100]
         */
        butt_offset_x: number,
        /**
         * Bodily wastes are created here
         * - Hints: 0 [-100, 100]
         */
        butt_offset_y: number,
        /**
         * The velocity at which our piss gets shot
         * - Hints: 0 [-1000, 1000]
         */
        pee_velocity_x: number,
        /**
         * The velocity at which our piss gets shot
         * - Hints: 0 [-1000, 1000]
         */
        pee_velocity_y: number,
        /**
         * If 1, we stop to eat if we encounter 'food_material' cells
         * - Hints: 1 [0, 1]
         */
        needs_food: boolean,
        /**
         * If 1, we occasionally search our surroundings for prey and threats
         * - Hints: 1 [0, 1]
         */
        sense_creatures: boolean,
        /**
         * If 1, will see creatures even if the wall raycast fails
         * - Hints: 0 [0, 1]
         */
        sense_creatures_through_walls: boolean,
        /**
         * If 1, we can fly. Please set 'PathFindingComponent.can_fly' to 1 as well if this is 1
         * - Hints: 1 [0, 1]
         */
        can_fly: boolean,
        /**
         * If 1, we can walk. Please set 'PathFindingComponent.can_walk' to 1 as well if this is 1
         * - Hints: 1 [0, 1]
         */
        can_walk: boolean,
        /**
         * If we're further than this from target path finding node on the X-axis we turn to face it
         * - Hints: 0 [0, 1000]
         */
        path_distance_to_target_node_to_turn_around: number,
        /**
         * If we get stuck on ground we create an explosion this big to clear our surroundings a bit
         * - Hints: 6 [0, 1000]
         */
        path_cleanup_explosion_radius: number,
        /**
         * - Hints: 0 [0, 1]
         */
        max_distance_to_move_from_home: number,
        /**
         * If we have explosion, it's the setup for it
         */
        attack_melee_finish_config_explosion: ComponentTypeMap['ConfigExplosion'],
        /**
         * The minimum number of frames we wait between ranged attacks
         */
        attack_ranged_frames_between: ComponentTypeMap['LensValue<int>'],
        /**
         * The cell material we eat if encountering said material and 'needs_food' is 1
         * - Hints: 0 [0, 1]
         */
        food_material: number,
        /**
         * We create particles made of this material when eating if 'food_eating_create_particles' is 1
         * - Hints: 0 [0, 1]
         */
        food_particle_effect_material: number,
        /**
         * the greater this value the more likely we're to attack creatures from other herds
         */
        mAggression: ComponentTypeMap['LensValue<float>'],
        /**
         * a stack of actions and times they take, we can push new actions to the front and pop them from there
         */
        mAiStateStack: ComponentTypeMap['AI_STATE_STACK'],
        /**
         * when was the last time we switched a state
         * - Hints: 0 [0, 1]
         */
        mAiStateLastSwitchFrame: number,
        /**
         * previous AI state
         * - Hints: 0 [0, 1]
         */
        mAiStatePrev: number,
        /**
         * threat/prey check, next time we check for threat/prey
         * - Hints: 0 [0, 1]
         */
        mCreatureDetectionNextCheck: number,
        /**
         * the entity we consider to be our greatest threat
         * - Hints: 0 [0, 1]
         */
        mGreatestThreat: ComponentTypeMap['EntityID'],
        /**
         * the entity we consider to be our most important prey
         * - Hints: 0 [0, 1]
         */
        mGreatestPrey: ComponentTypeMap['EntityID'],
        /**
         * which AIAttackComponent attack are we using?
         * - Hints: -1 [0, 1]
         */
        mSelectedMultiAttack: number,
        /**
         * 1, if we have ever found prey
         * - Hints: 0 [0, 1]
         */
        mHasFoundPrey: boolean,
        /**
         * 1, if we have been ever attacked
         * - Hints: 0 [0, 1]
         */
        mHasBeenAttackedByPlayer: boolean,
        /**
         * 1, if we have ever started attacking anyone
         * - Hints: 0 [0, 1]
         */
        mHasStartedAttacking: boolean,
        /**
         * amount of 'food_material' near us
         * - Hints: 0 [0, 1]
         */
        mNearbyFoodCount: number,
        /**
         * next frame we can eat
         * - Hints: 0 [0, 1]
         */
        mEatNextFrame: number,
        /**
         * time we've been constantly eating
         * - Hints: 0 [0, 1]
         */
        mEatTime: number,
        /**
         * next frame we consider ourselves to be stuck
         * - Hints: 0 [0, 1]
         */
        mFrameNextGiveUp: number,
        /**
         * AABB min of the area where we've been since the last time we got stuck
         */
        mLastFramesMovementAreaMin: ComponentTypeMap['vec2'],
        /**
         * AABB max of the area where we've been since the last time we got stuck
         */
        mLastFramesMovementAreaMax: ComponentTypeMap['vec2'],
        /**
         * cached id of 'food_material'
         * - Hints: -1 [0, 1]
         */
        mFoodMaterialId: number,
        /**
         * cached id of 'food_particle_effect_material'
         * - Hints: -1 [0, 1]
         */
        mFoodParticleEffectMaterialId: number,
        /**
         * we use this for next jump
         * - Hints: 1 [0, 1]
         */
        mNextJumpLob: number,
        /**
         * we use this for next jump
         */
        mNextJumpTarget: ComponentTypeMap['vec2'],
        /**
         * we use this for next jump
         * - Hints: 0 [0, 1]
         */
        mNextJumpHasVelocity: boolean,
        /**
         * previous frame we launched into a jump
         * - Hints: -1 [0, 1]
         */
        mLastFrameJumped: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFramesWithoutTarget: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mLastFrameCanDamageOwnHerd: number,
        /**
         * where our home is located
         */
        mHomePosition: ComponentTypeMap['vec2'],
        /**
         * when was the last time we did an attack (not necessarily did damage to anyone though)
         * - Hints: 0 [0, 1]
         */
        mLastFrameAttackWasDone: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrameCanCallFriend: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mNextFrameRespondFriend: number,
        /**
         * if 1, we have noticed player or player projectile
         * - Hints: 0 [0, 1]
         */
        mHasNoticedPlayer: boolean,
        /**
         * which direction does our gun currently point at, physically saying?
         * - Hints: 0 [0, 1]
         */
        mRangedAttackCurrentAimAngle: number,
        /**
         * next frame we can perform a ranged attack
         * - Hints: 0 [0, 1]
         */
        mRangedAttackNextFrame: number,
        /**
         * next frame we can perform a melee attack
         * - Hints: 0 [0, 1]
         */
        mMeleeAttackNextFrame: number,
        /**
         * the amount of damage our next melee attack will cause. used by finishing move logic
         * - Hints: 0 [0, 1]
         */
        mNextMeleeAttackDamage: number,
        /**
         * 1, if we're doing a melee attack
         * - Hints: 0 [0, 1]
         */
        mMeleeAttacking: boolean,
        /**
         * the next frame we can perform a melee attack
         * - Hints: 0 [0, 1]
         */
        mMeleeAttackDashNextFrame: number,
        /**
         * info about our current job. sorta legacy and could be simplified because the RTS logic is not used anywhere but doesn't have much overhead either.
         */
        mCurrentJob: ComponentTypeMap['RtsUnitGoal'],
    };
    ArcComponent: {
        /**
         * remaining number of frames the arc exists
         * - Hints: 60 [0, 1]
         */
        lifetime: number,
        /**
         * which implementation the arc should use
         */
        type: ComponentTypeMap['ARC_TYPE::Enum'],
        /**
         * string name for the material the arc is made of
         * - Hints: 0 [0, 1]
         */
        material: number,
        /**
         * if 'mArcTarget' points to an existing entity a lighting arc will be created between this entity and 'mArcTarget'
         * - Hints: 0 [0, 1]
         */
        mArcTarget: ComponentTypeMap['EntityID'],
    };
    AreaDamageComponent: {
        /**
         * if > 0, will only damage entities inside the aabb rectangle which are closer than 'circle_radius' to the aabb center.
         * - Hints: 0 [0, 1]
         */
        circle_radius: number,
        /**
         * - Hints: 10 [0, 256]
         */
        damage_per_frame: number,
        /**
         * - Hints: 1 [0, 60]
         */
        update_every_n_frame: number,
        /**
         * if NULL, will try to figure out who to blame
         * - Hints: 0 [0, 1]
         */
        entity_responsible: ComponentTypeMap['EntityID'],
        /**
         * - Hints: $damage_curse [0, 60]
         */
        death_cause: string,
        /**
         * damage entities with this tag
         * - Hints: mortal [0, 1]
         */
        entities_with_tag: string,
        /**
         */
        aabb_min: ComponentTypeMap['vec2'],
        /**
         */
        aabb_max: ComponentTypeMap['vec2'],
        /**
         * the damage type
         */
        damage_type: ComponentTypeMap['DAMAGE_TYPES::Enum'],
    };
    AttachToEntityComponent: {
        /**
         * if 1, we only inherit position. it is calculated as follows: target_position + target_offset * target_scale
         * - Hints: 0 [0, 1]
         */
        only_position: boolean,
        /**
         * if set, we apply the offset of target HotSpot with this tag
         */
        target_hotspot_tag: string,
        /**
         * if >= 0, the Nth sprite transform in target entity is inherited
         * - Hints: -1 [0, 1]
         */
        target_sprite_id: number,
        /**
         * if 1, the rotation is set to 0 deg if scale >= 0 else to 180 deg
         * - Hints: 0 [0, 1]
         */
        rotate_based_on_x_scale: boolean,
        /**
         * should probably be on by default
         * - Hints: 1 [0, 1]
         */
        destroy_component_when_target_is_gone: boolean,
        /**
         */
        Transform: ComponentTypeMap['types::xform'],
        /**
         * EntityID of the entity we're attached to. This will fail after save/load, unfortunately
         * - Hints: 0 [0, 1]
         */
        target: ComponentTypeMap['EntityID'],
        /**
         * - Hints: -1 [0, 1]
         */
        mUpdateFrame: number,
    };
    AudioComponent: {
        /**
         */
        file: string,
        /**
         */
        event_root: string,
        /**
         */
        audio_physics_material: string,
        /**
         * - Hints: 0 [0, 1]
         */
        set_latest_event_position: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        remove_latest_event_on_destroyed: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        send_message_on_event_dead: boolean,
        /**
         * plays sounds only if entity position is on screen and not covered by fog of war
         * - Hints: 0 [0, 1]
         */
        play_only_if_visible: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        m_audio_physics_material: number,
        /**
         * - Hints: -1 [0, 1]
         */
        m_latest_source: ComponentTypeMap['AudioSourceHandle'],
    };
    AudioListenerComponent: {
        /**
         * - Hints: 0 [-500, 500]
         */
        z: number,
    };
    AudioLoopComponent: {
        /**
         */
        file: string,
        /**
         */
        event_name: string,
        /**
         * - Hints: 0 [0, 1]
         */
        auto_play: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        auto_play_if_enabled: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        play_on_component_enable: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        calculate_material_lowpass: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        set_speed_parameter: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        set_speed_parameter_only_based_on_x_movement: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        set_speed_parameter_only_based_on_y_movement: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        volume_autofade_speed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        m_volume: number,
        /**
         * - Hints: 1 [0, 1]
         */
        m_intensity: number,
        /**
         * - Hints: 1 [0, 1]
         */
        m_intensity2: number,
        /**
         * - Hints: -1 [0, 1]
         */
        m_source: ComponentTypeMap['AudioSourceHandle'],
        /**
         * - Hints: -1 [0, 1]
         */
        m_frame_created: number,
    };
    BiomeTrackerComponent: {
        /**
         * if > 1, we will only check the biome every n frames
         * - Hints: 0 [0, 1]
         */
        limit_to_every_n_frame: number,
        /**
         * DO NOT ACCESS, since this can be in valid
         */
        unsafe_current_biome: ComponentTypeMap['Biome*'],
        /**
         * used to track in which biome we are at
         */
        current_biome_name: string,
    };
    BlackHoleComponent: {
        /**
         * - Hints: 16 [0, 128]
         */
        radius: number,
        /**
         * - Hints: 2 [0, 32]
         */
        particle_attractor_force: number,
        /**
         * - Hints: 0.25 [0, 1]
         */
        damage_probability: number,
        /**
         * - Hints: 0.1 [0, 10]
         */
        damage_amount: number,
        /**
         * - Hints: -1 [0, 1]
         */
        m_particle_attractor_id: ComponentTypeMap['int16'],
    };
    BookComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMPY: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
    };
    BossDragonComponent: {
        /**
         * - Hints: 1 [0, 10000]
         */
        speed: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        speed_hunt: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        acceleration: number,
        /**
         * - Hints: 1 [0, 10000]
         */
        direction_adjust_speed: number,
        /**
         * - Hints: 1 [0, 10000]
         */
        direction_adjust_speed_hunt: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        gravity: number,
        /**
         * - Hints: 30 [0, 10000]
         */
        tail_gravity: number,
        /**
         * - Hints: 10 [0, 10000]
         */
        part_distance: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        ground_check_offset: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        eat_ground_radius: number,
        /**
         * does the worm destroy the ground it moves through or not?
         * - Hints: 1 [0, 1]
         */
        eat_ground: boolean,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        hitbox_radius: number,
        /**
         * how much damage does this do when it hits an entity
         * - Hints: 2 [0, 10]
         */
        bite_damage: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        target_kill_radius: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        target_kill_ragdoll_force: number,
        /**
         * - Hints: 512 [0, 10000]
         */
        hunt_box_radius: number,
        /**
         * - Hints: 512 [0, 10000]
         */
        random_target_box_radius: number,
        /**
         * - Hints: 30 [0, 10000]
         */
        new_hunt_target_check_every: number,
        /**
         * - Hints: 120 [0, 10000]
         */
        new_random_target_check_every: number,
        /**
         * - Hints: 20 [0, 10000]
         */
        jump_cam_shake: number,
        /**
         * - Hints: 256 [0, 10000]
         */
        jump_cam_shake_distance: number,
        /**
         * - Hints: 0.05 [0, 10000]
         */
        eat_anim_wait_mult: number,
        /**
         * - Hints: data/entities/projectiles/bossdragon.xml [0, 1]
         */
        projectile_1: string,
        /**
         * - Hints: 2 [0, 10]
         */
        projectile_1_count: number,
        /**
         * - Hints: data/entities/projectiles/bossdragon_ray.xml [0, 1]
         */
        projectile_2: string,
        /**
         * - Hints: 5 [0, 10]
         */
        projectile_2_count: number,
        /**
         */
        ragdoll_filename: string,
        /**
         * - Hints: 0 [0, 1]
         */
        mTargetEntityId: number,
        /**
         */
        mTargetVec: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mGravVelocity: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mSpeed: number,
        /**
         */
        mRandomTarget: ComponentTypeMap['vec2'],
        /**
         */
        mLastLivingTargetPos: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextTargetCheckFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextHuntTargetCheckFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mOnGroundPrev: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mMaterialIdPrev: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPhase: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextPhaseSwitchTime: number,
        /**
         * - Hints: 2 [0, 1]
         */
        mPartDistance: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mIsInitialized: boolean,
    };
    BossHealthBarComponent: {
        /**
         * - Hints: 1 [0, 1]
         */
        gui: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        gui_special_final_boss: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        in_world: boolean,
        /**
         * - Hints: 600 [0, 1]
         */
        gui_max_distance_visible: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mOldSpritesDestroyed: boolean,
    };
    CameraBoundComponent: {
        /**
         * If enabled, kills this component if it's outside the camera distance
         * - Hints: 1 [0, 1]
         */
        enabled: boolean,
        /**
         * Distance in pixels from the center of camera, if outside this distance the entity is destroyed
         * - Hints: 250 [0, 1024]
         */
        distance: number,
        /**
         * Offset towards camera in pixels from 'distance' where the entity is respawned if it was frozen
         * - Hints: 20 [0, 1024]
         */
        distance_border: number,
        /**
         * If more than 'max_count' entities of this type exist the one furthest from camera is destroyed
         * - Hints: 10 [0, 1024]
         */
        max_count: number,
        /**
         * If true and the entity went too far - this entity will be stored so we can later respawn it where it was destroyed because it got too far from the camera?
         * - Hints: 1 [0, 1]
         */
        freeze_on_distance_kill: boolean,
        /**
         * If true and the entity was one too many of its kind - this entity will be stored so we can later respawn it where it was destroyed because it got too far from the camera?
         * - Hints: 1 [0, 1]
         */
        freeze_on_max_count_kill: boolean,
    };
    CardinalMovementComponent: {
        /**
         * allow horizontal movement
         * - Hints: 1 [0, 1]
         */
        horizontal_movement: boolean,
        /**
         * allow vertical movement
         * - Hints: 1 [0, 1]
         */
        vertical_movement: boolean,
        /**
         * allow intercardinal movement
         * - Hints: 0 [0, 1]
         */
        intercardinal_movement: boolean,
        /**
         */
        mPrevPos: ComponentTypeMap['vec2'],
    };
    CellEaterComponent: {
        /**
         * - Hints: 10 [0, 100]
         */
        radius: number,
        /**
         * - Hints: 100 [0, 100]
         */
        eat_probability: number,
        /**
         * - Hints: 0 [0, 1]
         */
        only_stain: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        eat_dynamic_physics_bodies: boolean,
        /**
         * if true, will only eat the materials defined in material_list
         * - Hints: 0 [0, 1]
         */
        limited_materials: boolean,
        /**
         * if set, will not eat any materials with this tag. please note that this lowers the performance of cell eating by some amount.
         */
        ignored_material_tag: string,
        /**
         * String name of a material that shouldn't be eaten by the component
         * - Hints: 0 [0, 1]
         */
        ignored_material: number,
        /**
         * is a list of accepted materials sorted
         */
        materials: ComponentTypeMap['VEC_OF_MATERIALS'],
    };
    CharacterCollisionComponent: {
        /**
         * - Hints: 5 [0, 100]
         */
        getting_crushed_threshold: number,
        /**
         * - Hints: 3 [0, 100]
         */
        moving_up_before_getting_crushed_threshold: number,
        /**
         * 1.12.2018 - Is this still used?
         * - Hints: 0 [0, 1]
         */
        getting_crushed_counter: number,
        /**
         * used this mostly for player to figure out if it's stuck in ground
         * - Hints: 0 [0, 1]
         */
        stuck_in_ground_counter: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCollidedHorizontally: boolean,
    };
    CharacterDataComponent: {
        /**
         * 0 = oldest, 1 = newer, 2 = safest
         * - Hints: 0 [0, 3]
         */
        platforming_type: number,
        /**
         * 1.0 = approx. mass of player
         * - Hints: 1 [0, 10]
         */
        mass: number,
        /**
         * - Hints: -6 [-1000, 1000]
         */
        buoyancy_check_offset_y: number,
        /**
         * how much do liquids move this character. e.g. when standing in a flowing river
         * - Hints: 9 [0, 20]
         */
        liquid_velocity_coeff: number,
        /**
         * - Hints: 100 [0, 250]
         */
        gravity: number,
        /**
         * - Hints: 0 [0, 250]
         */
        fly_recharge_spd: number,
        /**
         * - Hints: 0 [0, 250]
         */
        fly_recharge_spd_ground: number,
        /**
         * const variable... player has this as true
         * - Hints: 0 [0, 1]
         */
        flying_needs_recharge: boolean,
        /**
         * to fix the tap tap tap flying cheese, we wait this many frames before recharging in air
         * - Hints: 44 [0, 200]
         */
        flying_in_air_wait_frames: number,
        /**
         * another fix to the tap tap - this is how many frames from pressing down up we'll remove fly charge
         * - Hints: 8 [0, 20]
         */
        flying_recharge_removal_frames: number,
        /**
         * - Hints: 3 [0, 10]
         */
        climb_over_y: number,
        /**
         * - Hints: 5 [0, 50]
         */
        check_collision_max_size_x: number,
        /**
         * - Hints: 5 [0, 50]
         */
        check_collision_max_size_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        is_on_ground: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_on_slippery_ground: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        ground_stickyness: number,
        /**
         * - Hints: 0 [0, 1]
         */
        effect_hit_ground: boolean,
        /**
         * if we want to damage ground when hitting it... this is the place
         * - Hints: 0 [0, 1]
         */
        eff_hg_damage_min: number,
        /**
         * if we want to damage ground when hitting it... this is the place
         * - Hints: 0 [0, 1]
         */
        eff_hg_damage_max: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        eff_hg_position_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        eff_hg_position_y: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        eff_hg_size_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        eff_hg_size_y: number,
        /**
         * - Hints: 0 [-65, 65]
         */
        eff_hg_velocity_min_x: number,
        /**
         * - Hints: 0 [-65, 65]
         */
        eff_hg_velocity_max_x: number,
        /**
         * - Hints: 0 [-65, 65]
         */
        eff_hg_velocity_min_y: number,
        /**
         * - Hints: 0 [-65, 65]
         */
        eff_hg_velocity_max_y: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        eff_hg_offset_y: number,
        /**
         * if true, will move physics bodies that it hits
         * - Hints: 0 [0, 1]
         */
        eff_hg_update_box2d: boolean,
        /**
         * multiplies the velocity with this...
         * - Hints: 0.0035 [0, 1]
         */
        eff_hg_b2force_multiplier: number,
        /**
         * how much damage do we do the ground when land on it
         * - Hints: 0 [0, 1]
         */
        destroy_ground: number,
        /**
         * if 1, will send Message_TransformUpdated to updated entities and their children when the component is processed by PlayerCollisionSystem or CharacterCollisionSystem
         * - Hints: 0 [0, 1]
         */
        send_transform_update_message: boolean,
        /**
         * might be useful if you want to use CharacterCollisionSystem to only update on_ground status
         * - Hints: 0 [0, 1]
         */
        dont_update_velocity_and_xform: boolean,
        /**
         * How much flying energy do we have left? - NOTE( Petri ): 1.3.2023 - This used to be a private variable. It was changed to fix the save/load infinite flying bug.
         * - Hints: 1000 [0, 1]
         */
        mFlyingTimeLeft: number,
        /**
         */
        collision_aabb_min_x: ComponentTypeMap['LensValue<float>'],
        /**
         */
        collision_aabb_max_x: ComponentTypeMap['LensValue<float>'],
        /**
         */
        collision_aabb_min_y: ComponentTypeMap['LensValue<float>'],
        /**
         */
        collision_aabb_max_y: ComponentTypeMap['LensValue<float>'],
        /**
         * how much flying energy + 
         */
        fly_time_max: ComponentTypeMap['LensValue<float>'],
        /**
         * - Hints: 0 [0, 1]
         */
        mFramesOnGround: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mLastFrameOnGround: number,
        /**
         */
        mVelocity: ComponentTypeMap['vec2'],
        /**
         * moved this here from CharacterCollisionComponent - since that is multithreaded and we needed a non multithreaded version
         * - Hints: 0 [0, 1]
         */
        mCollidedHorizontally: boolean,
    };
    CharacterPlatformingComponent: {
        /**
         * - Hints: 0 [0, 500]
         */
        jump_velocity_x: number,
        /**
         * - Hints: -175 [-500, 0]
         */
        jump_velocity_y: number,
        /**
         * - Hints: 2 [0, 10]
         */
        jump_keydown_buffer: number,
        /**
         * AI stuff
         * - Hints: 0 [-100, 100]
         */
        fly_speed_mult: number,
        /**
         * player
         * - Hints: 5 [0, 1000]
         */
        fly_speed_change_spd: number,
        /**
         * if true, uses player fly model
         * - Hints: 0 [0, 1]
         */
        fly_model_player: boolean,
        /**
         * if true, smooths out the AI fly model
         * - Hints: 1 [0, 1]
         */
        fly_smooth_y: boolean,
        /**
         * - Hints: 1 [0, 1000]
         */
        accel_x: number,
        /**
         * - Hints: 0.1 [0, 1000]
         */
        accel_x_air: number,
        /**
         * - Hints: 600 [0, 1000]
         */
        pixel_gravity: number,
        /**
         * - Hints: 1.2 [0, 2]
         */
        swim_idle_buoyancy_coeff: number,
        /**
         * - Hints: 0.7 [0, 2]
         */
        swim_down_buoyancy_coeff: number,
        /**
         * - Hints: 0.9 [0, 2]
         */
        swim_up_buoyancy_coeff: number,
        /**
         * when in water velocity *= swim_drag
         * - Hints: 0.95 [0, 2]
         */
        swim_drag: number,
        /**
         * when in water velocity.x *= swim_extra_horizontal_drag
         * - Hints: 0.9 [0, 2]
         */
        swim_extra_horizontal_drag: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mouse_look: boolean,
        /**
         * - Hints: 1 [0, 5]
         */
        mouse_look_buffer: number,
        /**
         * if true, turns based on if left or right has been pressed down
         * - Hints: 0 [0, 1]
         */
        keyboard_look: boolean,
        /**
         * - Hints: 0.1 [0, 2]
         */
        turning_buffer: number,
        /**
         */
        animation_to_play: string,
        /**
         */
        animation_to_play_next: string,
        /**
         * - Hints: 45 [0, 1000]
         */
        run_animation_velocity_switching_threshold: number,
        /**
         * - Hints: 0 [0, 1]
         */
        run_animation_velocity_switching_enabled: boolean,
        /**
         * - Hints: 20 [0, 100]
         */
        turn_animation_frames_between: number,
        /**
         * maximum duration of precision jump or knockback. -1 = infinite
         * - Hints: -1 [0, 1]
         */
        precision_jumping_max_duration_frames: number,
        /**
         * - Hints: 1 [0, 1]
         */
        audio_liquid_splash_intensity: number,
        /**
         */
        velocity_min_x: ComponentTypeMap['LensValue<float>'],
        /**
         */
        velocity_max_x: ComponentTypeMap['LensValue<float>'],
        /**
         */
        velocity_min_y: ComponentTypeMap['LensValue<float>'],
        /**
         */
        velocity_max_y: ComponentTypeMap['LensValue<float>'],
        /**
         */
        run_velocity: ComponentTypeMap['LensValue<float>'],
        /**
         */
        fly_velocity_x: ComponentTypeMap['LensValue<float>'],
        /**
         */
        fly_speed_max_up: ComponentTypeMap['LensValue<float>'],
        /**
         */
        fly_speed_max_down: ComponentTypeMap['LensValue<float>'],
        /**
         */
        mExAnimationPos: ComponentTypeMap['vec2'],
        /**
         * - Hints: -1 [0, 1]
         */
        mFramesInAirCounter: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mIsPrecisionJumping: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mPrecisionJumpingTime: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPrecisionJumpingSpeedX: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPrecisionJumpingTimeLeft: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFlyThrottle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mSmoothedFlyingTargetY: number,
        /**
         * -1 = undefined, 0 = not emitting, 1 = emitting
         * - Hints: -1 [0, 1]
         */
        mJetpackEmitting: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextTurnAnimationFrame: number,
        /**
         * 0 = currently swimming
         * - Hints: 10 [0, 1]
         */
        mFramesNotSwimming: number,
        /**
         * 0 = not currently swimming
         * - Hints: 0 [0, 1]
         */
        mFramesSwimming: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mShouldCrouch: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mShouldCrouchPrev: boolean,
        /**
         * - Hints: -1 [0, 1]
         */
        mLastPostureSwitchFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mLookOverrideLastFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mLookOverrideDirection: number,
    };
    CharacterStatsComponent: {
        /**
         */
        stats: ComponentTypeMap['CharacterStatsModifier'],
    };
    CollisionTriggerComponent: {
        /**
         * - Hints: 32 [0, 100]
         */
        width: number,
        /**
         * - Hints: 32 [0, 100]
         */
        height: number,
        /**
         * - Hints: 32 [0, 100]
         */
        radius: number,
        /**
         * - Hints: mortal [0, 1]
         */
        required_tag: string,
        /**
         * - Hints: 0 [0, 1]
         */
        remove_component_when_triggered: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        destroy_this_entity_when_triggered: boolean,
        /**
         * - Hints: 0 [0, 60]
         */
        timer_for_destruction: number,
        /**
         * if true, the shooter can trigger it
         * - Hints: 0 [0, 1]
         */
        self_trigger: boolean,
        /**
         * skips checks against self during these frames
         * - Hints: 60 [0, 1]
         */
        skip_self_frames: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mTimer: number,
    };
    ConsumableTeleportComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        create_other_end: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_at_home: boolean,
        /**
         * - Hints: 10 [0, 20]
         */
        collision_radius: number,
        /**
         * - Hints: 0 [0, 1]
         */
        target_id: ComponentTypeMap['uint32'],
        /**
         * - Hints: 0 [0, 1]
         */
        id: ComponentTypeMap['uint32'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextUsableFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mHasOtherEnd: boolean,
        /**
         */
        target_location: ComponentTypeMap['vec2'],
    };
    ControllerGoombaAIComponent: {
        /**
         * disable this if you don't want creature to 'look around', while standing still
         * - Hints: 1 [0, 1]
         */
        auto_turn_around_enabled: boolean,
        /**
         * - Hints: 50 [0, 300]
         */
        wait_to_turn_around: number,
        /**
         * - Hints: 10 [0, 300]
         */
        wall_hit_wait: number,
        /**
         * - Hints: 1 [0, 1]
         */
        check_wall_detection: boolean,
        /**
         * - Hints: 0 [-15, 15]
         */
        wall_detection_aabb_min_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        wall_detection_aabb_max_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        wall_detection_aabb_min_y: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        wall_detection_aabb_max_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        check_floor_detection: boolean,
        /**
         * - Hints: 0 [-15, 15]
         */
        floor_detection_aabb_min_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        floor_detection_aabb_max_x: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        floor_detection_aabb_min_y: number,
        /**
         * - Hints: 0 [-15, 15]
         */
        floor_detection_aabb_max_y: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mChangingDirectionCounter: number,
    };
    ControlsComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        polymorph_hax: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        polymorph_next_attack_frame: number,
        /**
         * - Hints: 1 [0, 1]
         */
        enabled: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        gamepad_indirect_aiming_enabled: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        gamepad_fire_on_thumbstick_extend: boolean,
        /**
         * - Hints: 0.7 [0, 1]
         */
        gamepad_fire_on_thumbstick_extend_threshold: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownFire: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameFire: number,
        /**
         * - Hints: -2 [0, 1]
         */
        mButtonLastFrameFire: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownFire2: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameFire2: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownAction: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameAction: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownThrow: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameThrow: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownInteract: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameInteract: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownLeft: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameLeft: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownRight: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameRight: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownUp: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameUp: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownDown: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameDown: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownJump: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameJump: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownRun: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameRun: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownFly: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameFly: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownDig: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameDig: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownChangeItemR: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameChangeItemR: number,
        /**
         * note these have special count property
         * - Hints: 0 [0, 1]
         */
        mButtonCountChangeItemR: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownChangeItemL: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameChangeItemL: number,
        /**
         * note these have special count property
         * - Hints: 0 [0, 1]
         */
        mButtonCountChangeItemL: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownInventory: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameInventory: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownHolsterItem: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameHolsterItem: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownDropItem: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameDropItem: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownKick: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameKick: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonDownEat: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mButtonFrameEat: number,
        /**
         * NOTE! Ignores gamepad, if mouse is pressed this will be true.
         * - Hints: 0 [0, 1]
         */
        mButtonDownLeftClick: boolean,
        /**
         * NOTE! Ignores gamepad, if mouse is pressed this will be true.
         * - Hints: 0 [0, 1]
         */
        mButtonFrameLeftClick: number,
        /**
         * NOTE! Ignores gamepad, if mouse is pressed this will be true.
         * - Hints: 0 [0, 1]
         */
        mButtonDownRightClick: boolean,
        /**
         * NOTE! Ignores gamepad, if mouse is pressed this will be true.
         * - Hints: 0 [0, 1]
         */
        mButtonFrameRightClick: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonDownTransformLeft: boolean,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonFrameTransformLeft: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonDownTransformRight: boolean,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonFrameTransformRight: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonDownTransformUp: boolean,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonFrameTransformUp: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonCountTransformUp: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonDownTransformDown: boolean,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonFrameTransformDown: number,
        /**
         * NOT IN USE!
         * - Hints: 0 [0, 1]
         */
        mButtonCountTransformDown: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFlyingTargetY: number,
        /**
         */
        mAimingVector: ComponentTypeMap['vec2'],
        /**
         * Aiming vector normalized to unit sphere.
         */
        mAimingVectorNormalized: ComponentTypeMap['vec2'],
        /**
         */
        mAimingVectorNonZeroLatest: ComponentTypeMap['vec2'],
        /**
         */
        mGamepadAimingVectorRaw: ComponentTypeMap['vec2'],
        /**
         * used mostly by AI only?
         */
        mJumpVelocity: ComponentTypeMap['vec2'],
        /**
         */
        mMousePosition: ComponentTypeMap['vec2'],
        /**
         */
        mMousePositionRaw: ComponentTypeMap['vec2'],
        /**
         */
        mMousePositionRawPrev: ComponentTypeMap['vec2'],
        /**
         */
        mMouseDelta: ComponentTypeMap['vec2'],
        /**
         */
        mGamepadIndirectAiming: ComponentTypeMap['vec2'],
        /**
         * where the aiming cursor is in the world, updated by platformshooterplayer_system 
         */
        mGamePadCursorInWorld: ComponentTypeMap['vec2'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineFire: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineFire2: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineRight: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineLeft: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineUp: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineDown: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineKick: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineThrow: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineJump: ComponentTypeMap['uint32_t'],
        /**
         * Used to delay input for some game effects
         * - Hints: 0 [0, 1]
         */
        mButtonDownDelayLineFly: ComponentTypeMap['uint32_t'],
        /**
         * Adds latency to some inputs. Used by some game effects. Max 31.
         */
        input_latency_frames: ComponentTypeMap['LensValue<int>'],
    };
    CrawlerAnimalComponent: {
        /**
         * - Hints: 5 [0, 100]
         */
        ray_length: number,
        /**
         * - Hints: 16 [0, 64]
         */
        ray_count: number,
        /**
         * - Hints: 600 [0, 10000]
         */
        gravity: number,
        /**
         * - Hints: 600 [0, 10000]
         */
        terminal_velocity: number,
        /**
         * - Hints: 0.2 [0, 10000]
         */
        speed: number,
        /**
         * - Hints: 20 [0, 1000]
         */
        give_up_area_radius: number,
        /**
         * - Hints: 45 [0, 1000]
         */
        give_up_time: number,
        /**
         * - Hints: 128 [0, 1000]
         */
        attack_from_ceiling_check_ray_length: number,
        /**
         * - Hints: 15 [0, 1000]
         */
        attack_from_ceiling_check_every_n_frames: number,
        /**
         * - Hints: 0.25 [0, 1000]
         */
        collision_damage: number,
        /**
         * - Hints: 10 [0, 1000]
         */
        collision_damage_radius: number,
        /**
         * - Hints: 10 [0, 1000]
         */
        collision_damage_frames_between: number,
        /**
         * - Hints: 1 [0, 1]
         */
        animate: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        mDir: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mFrameNextGiveUp: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFrameNextDamage: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFrameNextAttackFromCeilingCheck: number,
        /**
         */
        mMin: ComponentTypeMap['vec2'],
        /**
         */
        mMax: ComponentTypeMap['vec2'],
        /**
         */
        mPrevNonSnappedPosition: ComponentTypeMap['vec2'],
        /**
         */
        mPrevCellPosition: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition2: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition3: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition4: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition5: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition6: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition7: ComponentTypeMap['ivec2'],
        /**
         */
        mPrevCellPosition8: ComponentTypeMap['ivec2'],
        /**
         */
        mLatestPosition: ComponentTypeMap['ivec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mPrevFalling: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mIsInitialized: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mVelocityY: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mAngle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mMovementStepAccumulator: number,
    };
    CutThroughWorldDoneHereComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        id_of_done_cut: ComponentTypeMap['uint32'],
    };
    DamageModelComponent: {
        /**
         * hit points at the moment
         * - Hints: 1 [0, 4]
         */
        hp: ComponentTypeMap['double'],
        /**
         * the maximum hp that this can have, we'll set this when loading
         * - Hints: 0 [0, 4]
         */
        max_hp: ComponentTypeMap['double'],
        /**
         * the maximum 'max_hp' that this can have, <= 0 means no limits. Used by perks such as GLASS_CANNON
         * - Hints: 0 [0, 12]
         */
        max_hp_cap: ComponentTypeMap['double'],
        /**
         * used for UI rendering
         * - Hints: 0 [0, 1]
         */
        max_hp_old: ComponentTypeMap['double'],
        /**
         * 0.0 = all critical damage multiplier is applied. 1.0 = no critical damage multiplier is applied
         * - Hints: 0 [0, 1]
         */
        critical_damage_resistance: number,
        /**
         * if positive, doesn't take damage
         * - Hints: 0 [0, 1024]
         */
        invincibility_frames: number,
        /**
         * do we take fall damage
         * - Hints: 1 [0, 1]
         */
        falling_damages: boolean,
        /**
         * how far do we need to fall to take damage, we start with this height, the peasant takes min damage from this
         * - Hints: 70 [0, 1]
         */
        falling_damage_height_min: number,
        /**
         * after this the peasant always takes the maximum fall damage
         * - Hints: 250 [0, 1]
         */
        falling_damage_height_max: number,
        /**
         * when we fall over height_min we take this much, lineary ramping to damage_max
         * - Hints: 0.1 [0, 1]
         */
        falling_damage_damage_min: number,
        /**
         * when we fall over height_min we take this much, lineary ramping to damage_max
         * - Hints: 1.2 [0, 1]
         */
        falling_damage_damage_max: number,
        /**
         * Do we breath, can we take damage from not breathing?
         * - Hints: 1 [0, 1]
         */
        air_needed: boolean,
        /**
         * How much air do we have in our lungs? - after the air runs out we take damage
         * - Hints: 5 [0, 1]
         */
        air_in_lungs: number,
        /**
         * how much air can we have in our lungs, it's filled to this point if we're not in water
         * - Hints: 5 [0, 1]
         */
        air_in_lungs_max: number,
        /**
         * (* dt)... damage in a second if we're in the water
         * - Hints: 0.2 [0, 1]
         */
        air_lack_of_damage: number,
        /**
         * Minimum knockback force required to do the knockback
         * - Hints: 0 [0, 1]
         */
        minimum_knockback_force: number,
        /**
         * should materials do damage or not?
         * - Hints: 1 [0, 1]
         */
        materials_damage: boolean,
        /**
         * if material damage is received from less than 'material_damage_min_cell_count' this frame, it is ignored
         * - Hints: 4 [0, 1]
         */
        material_damage_min_cell_count: number,
        /**
         * list of materials that do damage, separated by ',' e.g. 'acid, fire, smoke'
         * - Hints: acid [0, 1]
         */
        materials_that_damage: string,
        /**
         * list of damage amount per material in materials_that_damage, separated by ','
         * - Hints: 0.1 [0, 1]
         */
        materials_how_much_damage: string,
        /**
         * if damage from materials is proportional to max hp, instead of just damage
         * - Hints: 0 [0, 1]
         */
        materials_damage_proportional_to_maxhp: boolean,
        /**
         * if true, will take damage from physics objects that hit it
         * - Hints: 0 [0, 1]
         */
        physics_objects_damage: boolean,
        /**
         * should collisions with certain materials create messages or not?
         * - Hints: 0 [0, 1]
         */
        materials_create_messages: boolean,
        /**
         * list of materials that generate CollisionWithCell messages, separated by ',' e.g. 'acid, fire, smoke'
         * - Hints: meat [0, 1]
         */
        materials_that_create_messages: string,
        /**
         * the file from which to load a ragdoll on death'
         * - Hints: data/temp/ragdoll/filenames.txt [0, 1]
         */
        ragdoll_filenames_file: string,
        /**
         * what material is the ragdoll made out of
         * - Hints: meat [0, 1]
         */
        ragdoll_material: string,
        /**
         * where should the ragdoll be created relative to our entity position'
         * - Hints: 0 [0, 1]
         */
        ragdoll_offset_x: number,
        /**
         * where should the ragdoll be created relative to our entity position'
         * - Hints: 0 [0, 1]
         */
        ragdoll_offset_y: number,
        /**
         * this is the material that gets thrown as particles when this entity takes damage
         * - Hints: blood_fading [0, 1]
         */
        blood_material: string,
        /**
         * this is the material that gets thrown as particles when this entity sprays blood on death
         */
        blood_spray_material: string,
        /**
         * if true, we force some blood spray particles to be cosmetic (can be enabled to avoid making a huge mess of blood spray)
         * - Hints: 0 [0, 1]
         */
        blood_spray_create_some_cosmetic: boolean,
        /**
         * how much blood, this is the multiplier used for sprouting lots or little blood
         * - Hints: 1 [0, 10]
         */
        blood_multiplier: number,
        /**
         * if > -1, this is the absolute amount of blood we share between particle emitters in the ragdoll
         * - Hints: -1 [-1, 1000]
         */
        ragdoll_blood_amount_absolute: number,
        /**
         * this sprite is loaded at damage position if we take damage that creates a blood effect
         */
        blood_sprite_directional: string,
        /**
         * this sprite is loaded at damage position if we take explosion/heavy damage
         */
        blood_sprite_large: string,
        /**
         * if this is set, will load this entity as a child of this entity, when this entity is healed
         */
        healing_particle_effect_entity: string,
        /**
         * if 0, we skip ragdoll creation on death
         * - Hints: 1 [0, 1]
         */
        create_ragdoll: boolean,
        /**
         * if 1, we ragdollify child entity sprites
         * - Hints: 0 [0, 1]
         */
        ragdollify_child_entity_sprites: boolean,
        /**
         * If ragdoll_filenames_file= and > 0, the angular damping of the first ragdoll body is set to this value.
         * - Hints: 0 [0, 1]
         */
        ragdollify_root_angular_damping: number,
        /**
         * If ragdoll_filenames_file= and true, all but the first sprite on the root entity will be disintegrated instead of being turned into physics bodies.
         * - Hints: 0 [0, 1]
         */
        ragdollify_disintegrate_nonroot: boolean,
        /**
         * if 1, we wont kill the entity along with kill fx and ragdoll until 'kill' is 1
         * - Hints: 0 [0, 1]
         */
        wait_for_kill_flag_on_death: boolean,
        /**
         * if 1, we wont kill the entity along with kill fx and ragdoll until 'kill_now' is 1
         * - Hints: 0 [0, 1]
         */
        kill_now: boolean,
        /**
         * drop the abilities as items on death?
         * - Hints: 1 [0, 1]
         */
        drop_items_on_death: boolean,
        /**
         * If 1, damage numbers are displayed when this entity is damaged
         * - Hints: 1 [0, 1]
         */
        ui_report_damage: boolean,
        /**
         * If 1, damage numbers are displayed when this entity is damaged, even if the numbers are disabled in settings
         * - Hints: 0 [0, 1]
         */
        ui_force_report_damage: boolean,
        /**
         * when shooting underwater how likely are we to electrify the water
         * - Hints: 0 [0, 100]
         */
        in_liquid_shooting_electrify_prob: number,
        /**
         * how much damage per 10 frames is done if entity has 'wet' status effect
         * - Hints: 0 [0, 0.1]
         */
        wet_status_effect_damage: number,
        /**
         * Tells us we're on fire or not
         * - Hints: 0 [0, 1]
         */
        is_on_fire: boolean,
        /**
         * what is the probability that we'll ignite, 0 means won't ever ignite
         * - Hints: 0.5 [0, 1]
         */
        fire_probability_of_ignition: number,
        /**
         * how many fire particles do we generate each frame
         * - Hints: 4 [0, 10]
         */
        fire_how_much_fire_generates: number,
        /**
         * how much damage does being ignited do?
         * - Hints: 0.0003 [0, 2]
         */
        fire_damage_ignited_amount: number,
        /**
         * how much damage does fire do?, 0.2 is pretty good
         * - Hints: 0.2 [0, 2]
         */
        fire_damage_amount: number,
        /**
         * Last frame electricity has no effect. Should not be private!
         * - Hints: -2147483648 [0, 1]
         */
        mLastElectricityResistanceFrame: number,
        /**
         * Last frame a damage block message was displayed for this entity
         * - Hints: -2147483648 [0, 1]
         */
        mLastFrameReportedBlock: number,
        /**
         * used for UI rendering
         * - Hints: -10000 [0, 1]
         */
        mLastMaxHpChangeFrame: number,
        /**
         * the multipliers applied to different types of damage
         */
        damage_multipliers: ComponentTypeMap['ConfigDamagesByType'],
        /**
         * if set, will force this ragdoll fx to happen everytime
         */
        ragdoll_fx_forced: ComponentTypeMap['RAGDOLL_FX::Enum'],
        /**
         * private variable to check when we're on fire and not
         * - Hints: 0 [0, 1]
         */
        mIsOnFire: boolean,
        /**
         * this gets decreased if we can't ignite anything else
         * - Hints: 100 [0, 1]
         */
        mFireProbability: number,
        /**
         * this is the remaining frames we're on fire
         * - Hints: 0 [0, 1]
         */
        mFireFramesLeft: number,
        /**
         * this is the total duration in frames we're on fire
         * - Hints: 0 [0, 1]
         */
        mFireDurationFrames: number,
        /**
         * private variable to check when we could have been ignited or not
         * - Hints: 0 [0, 1]
         */
        mFireTriedIgniting: boolean,
        /**
         * an optimization, so we don't have to check everything every frame
         * - Hints: 0 [0, 1]
         */
        mLastCheckX: number,
        /**
         * an optimization, so we don't have to check everything every frame
         * - Hints: 0 [0, 1]
         */
        mLastCheckY: number,
        /**
         * an optimization, so we don't have to check everything every frame
         * - Hints: 0 [0, 1]
         */
        mLastCheckTime: number,
        /**
         * this is the last frame we took material damage
         * - Hints: 0 [0, 1]
         */
        mLastMaterialDamageFrame: number,
        /**
         * for fall damage, keeps a private variable about if we're on ground or not
         * - Hints: 0 [0, 1]
         */
        mFallIsOnGround: boolean,
        /**
         * private var to keep track of how high have we flown to
         * - Hints: 3.40282e+038 [0, 1]
         */
        mFallHighestY: number,
        /**
         * how many times have we fallen? This is used to make sure we don't take damage from the first fall
         * - Hints: 0 [0, 1]
         */
        mFallCount: number,
        /**
         * a private variable to track our state in drowning
         * - Hints: 0 [0, 1]
         */
        mAirAreWeInWater: boolean,
        /**
         * how many frames have been with air to breathe
         * - Hints: 0 [0, 1]
         */
        mAirFramesNotInWater: number,
        /**
         * a private variable to track our state in drowning
         * - Hints: 0 [0, 1]
         */
        mAirDoWeHave: boolean,
        /**
         * how many cells are there total
         * - Hints: 0 [0, 1]
         */
        mTotalCells: number,
        /**
         * how many of the cells are liquid
         * - Hints: 0 [0, 1]
         */
        mLiquidCount: number,
        /**
         * stores the liquid material we're in... may not be the most accurate
         * - Hints: -1 [0, 1]
         */
        mLiquidMaterialWeAreIn: number,
        /**
         * NOTE! Sorted! a list of materials that do damage (materials_that_damage)
         */
        mDamageMaterials: ComponentTypeMap['std::vector<int>'],
        /**
         * NOTE! Sorted! a list of materials that do damage (materials_that_damage)
         */
        mDamageMaterialsHowMuch: ComponentTypeMap['std::vector<float>'],
        /**
         * NOTE! Sorted! a list of materials that create messages (materials_that_create_messages)
         */
        mCollisionMessageMaterials: ComponentTypeMap['std::vector<int>'],
        /**
         * Number of cells per collided with this frame. Order matches mCollisionMessageMaterials
         */
        mCollisionMessageMaterialCountsThisFrame: ComponentTypeMap['std::vector<int>'],
        /**
         * A list of damage per material that damages us. In same order as materials
         */
        mMaterialDamageThisFrame: ComponentTypeMap['std::vector<float>'],
        /**
         * Amount of fall damage received this frame
         * - Hints: 0 [0, 1]
         */
        mFallDamageThisFrame: number,
        /**
         * Amount of electricity damage received this frame
         * - Hints: 0 [0, 1]
         */
        mElectricityDamageThisFrame: number,
        /**
         * max physics damage we have taken this round
         * - Hints: 0 [0, 1]
         */
        mPhysicsDamageThisFrame: number,
        /**
         * direction of physics damage
         */
        mPhysicsDamageVecThisFrame: ComponentTypeMap['vec2'],
        /**
         * frame number when we took physics damage
         * - Hints: 0 [0, 1]
         */
        mPhysicsDamageLastFrame: number,
        /**
         * the physics entity that hit us
         * - Hints: 0 [0, 1]
         */
        mPhysicsDamageEntity: ComponentTypeMap['EntityTypeID'],
        /**
         * who moved an object that hit us via telekinesis
         * - Hints: 0 [0, 1]
         */
        mPhysicsDamageTelekinesisCasterEntity: ComponentTypeMap['EntityTypeID'],
        /**
         * frame number when we took any damage
         * - Hints: -120 [0, 1]
         */
        mLastDamageFrame: number,
        /**
         * how much hp did we have a while ago?
         * - Hints: 0 [0, 1]
         */
        mHpBeforeLastDamage: ComponentTypeMap['double'],
        /**
         * used to optimized cases where lots of entities are taking fire damage
         * - Hints: 0 [0, 1]
         */
        mFireDamageBuffered: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFireDamageBufferedNextDeliveryFrame: ComponentTypeMap['int32'],
    };
    DamageNearbyEntitiesComponent: {
        /**
         * - Hints: 10 [0, 1]
         */
        radius: number,
        /**
         * - Hints: 0.1 [0, 1]
         */
        damage_min: number,
        /**
         * - Hints: 0.2 [0, 1]
         */
        damage_max: number,
        /**
         * - Hints: 5 [0, 1]
         */
        target_vec_max_len: number,
        /**
         * - Hints: 1 [0, 1]
         */
        knockback_multiplier: number,
        /**
         * - Hints: 20 [0, 1]
         */
        time_between_damaging: number,
        /**
         * - Hints: bite [0, 1]
         */
        damage_description: string,
        /**
         * - Hints: mortal [0, 1]
         */
        target_tag: string,
        /**
         * the damage type
         */
        damage_type: ComponentTypeMap['DAMAGE_TYPES::Enum'],
        /**
         */
        ragdoll_fx: ComponentTypeMap['RAGDOLL_FX::Enum'],
        /**
         */
        mVelocity: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextDamageFrame: number,
    };
    DebugFollowMouseComponent: {
    };
    DebugLogMessagesComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMPY: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
    };
    DebugSpatialVisualizerComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        min_x: number,
        /**
         * - Hints: 0 [0, 1]
         */
        min_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        max_x: number,
        /**
         * - Hints: 0 [0, 1]
         */
        max_y: number,
        /**
         * - Hints: 4294967295 [0, 1]
         */
        color: ComponentTypeMap['unsigned int'],
    };
    DieIfSpeedBelowComponent: {
        /**
         * The entity that owns this component is killed if its speed (via VelocityComponent) falls below this value.
         * - Hints: 1 [0, 1000]
         */
        min_speed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mMinSpeedSquared: number,
    };
    DroneLauncherComponent: {
        /**
         * - Hints: data/entities/misc/player_drone.xml [0, 1]
         */
        drone_entity_file: string,
    };
    DrugEffectComponent: {
        /**
         */
        drug_fx_target: ComponentTypeMap['ConfigDrugFx'],
        /**
         */
        m_drug_fx_current: ComponentTypeMap['ConfigDrugFx'],
    };
    DrugEffectModifierComponent: {
        /**
         */
        fx_add: ComponentTypeMap['ConfigDrugFx'],
        /**
         */
        fx_multiply: ComponentTypeMap['ConfigDrugFx'],
    };
    ElectricChargeComponent: {
        /**
         * - Hints: 120 [0, 240]
         */
        charge_time_frames: number,
        /**
         * - Hints: 120 [0, 240]
         */
        fx_velocity_max: number,
        /**
         * - Hints: 5 [0, 10]
         */
        electricity_emission_interval_frames: number,
        /**
         * - Hints: 2 [0, 20]
         */
        fx_emission_interval_min: number,
        /**
         * - Hints: 15 [0, 30]
         */
        fx_emission_interval_max: number,
        /**
         * - Hints: 0 [0, 1]
         */
        charge: number,
    };
    ElectricityComponent: {
        /**
         * - Hints: 1000 [0, 10000]
         */
        energy: number,
        /**
         * - Hints: 0 [0, 1]
         */
        probability_to_heat: number,
        /**
         * - Hints: 32 [0, 10000]
         */
        speed: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        splittings_min: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        splittings_max: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        splitting_energy_min: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        splitting_energy_max: number,
        /**
         * - Hints: 0 [0, 1]
         */
        hack_is_material_crack: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        hack_crack_ice: boolean,
        /**
         * if set will set the thing on fire where this is located at
         * - Hints: 0 [0, 1]
         */
        hack_is_set_fire: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mSplittingsLeft: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mSplittingEnergy: number,
        /**
         */
        mAvgDir: ComponentTypeMap['vec2'],
        /**
         */
        mPrevPos: ComponentTypeMap['ivec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mPrevMaterial: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mShouldPlaySound: boolean,
    };
    ElectricityReceiverComponent: {
        /**
         * - Hints: 0 [1, 3]
         */
        offset_x: number,
        /**
         * - Hints: 0 [1, 3]
         */
        offset_y: number,
        /**
         * - Hints: 1 [1, 3]
         */
        radius: number,
        /**
         * - Hints: 1 [1, 15]
         */
        active_time_frames: number,
        /**
         * - Hints: 0 [0, 60]
         */
        switch_on_msg_interval_frames: number,
        /**
         * - Hints: -1 [0, 15]
         */
        electrified_msg_interval_frames: number,
        /**
         * - Hints: -1000 [0, 1]
         */
        mLastFrameElectrified: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextElectrifiedMsgFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextSwitchOnMsgFrame: number,
    };
    ElectricitySourceComponent: {
        /**
         * - Hints: 5 [1, 16]
         */
        radius: number,
        /**
         * - Hints: 15 [1, 10]
         */
        emission_interval_frames: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrameEmitElectricity: number,
    };
    EndingMcGuffinComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMPY: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
    };
    EnergyShieldComponent: {
        /**
         * - Hints: 16 [0, 100]
         */
        radius: number,
        /**
         * - Hints: 1.5 [0, 10]
         */
        damage_multiplier: number,
        /**
         * - Hints: 1 [0, 10]
         */
        max_energy: number,
        /**
         * - Hints: 0.2 [0, 10]
         */
        energy_required_to_shield: number,
        /**
         * - Hints: 1 [0, 10]
         */
        recharge_speed: number,
        /**
         * if less than 180 we only provide partial cover to the current direction of the entity
         * - Hints: 360 [0, 360]
         */
        sector_degrees: number,
        /**
         * - Hints: 0 [0, 3]
         */
        energy: number,
        /**
         */
        mPrevPosition: ComponentTypeMap['vec2'],
    };
    ExplodeOnDamageComponent: {
        /**
         * rolls a dice (0 - 1) if we explode on death
         * - Hints: 1 [0, 1]
         */
        explode_on_death_percent: number,
        /**
         * rolls a dice (0 - 1) if we explode on damage
         * - Hints: 1 [0, 1]
         */
        explode_on_damage_percent: number,
        /**
         * if we get message about the physics body being modified, do we explode on what percent
         * - Hints: 0 [0, 1]
         */
        physics_body_modified_death_probability: number,
        /**
         * how big of percent of our body, do we need to lose before we explode
         * - Hints: 0.5 [0, 1]
         */
        physics_body_destruction_required: number,
        /**
         * if we have explosion, it's the setup for it
         */
        config_explosion: ComponentTypeMap['ConfigExplosion'],
        /**
         * - Hints: 0 [0, 1]
         */
        mDone: boolean,
    };
    ExplosionComponent: {
        /**
         * for timer
         * - Hints: 0 [0, 180]
         */
        timeout_frames: number,
        /**
         * a random value between 0 and 'timout_frames_random' is added to timer
         * - Hints: 0 [0, 180]
         */
        timeout_frames_random: number,
        /**
         * if 1, we kill the entity when exploding
         * - Hints: 1 [0, 1]
         */
        kill_entity: boolean,
        /**
         * - Hints: -1 [0, 1]
         */
        mTimerTriggerFrame: number,
        /**
         * setup for out explosion
         */
        config_explosion: ComponentTypeMap['ConfigExplosion'],
        /**
         * what triggers the explosion
         */
        trigger: ComponentTypeMap['EXPLOSION_TRIGGER_TYPE::Enum'],
    };
    FishAIComponent: {
        /**
         * - Hints: 0 [-1, 1]
         */
        direction: number,
        /**
         * - Hints: 100 [1, 1000]
         */
        speed: number,
        /**
         */
        aabb_min: ComponentTypeMap['vec2'],
        /**
         */
        aabb_max: ComponentTypeMap['vec2'],
        /**
         */
        velocity: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        stuck_counter: number,
        /**
         */
        mLastCheckPos: ComponentTypeMap['vec2'],
    };
    FlyingComponent: {
        /**
         * type of flight, 1 = perlin noise
         * - Hints: 0 [0, 1]
         */
        type: number,
        /**
         * frequency of the perlin noise sampling
         * - Hints: 0.2 [0, 1]
         */
        perlin_freq: number,
        /**
         * t *= perlin_time_freq
         * - Hints: 0.3 [0, 1]
         */
        perlin_time_freq: number,
        /**
         * wind velocity that gets added to the samples
         * - Hints: 0 [-1, 1]
         */
        perlin_wind_x: number,
        /**
         * wind velocity that gets added to the samples
         * - Hints: 0 [-1, 1]
         */
        perlin_wind_y: number,
    };
    FogOfWarRadiusComponent: {
        /**
         * 256 is the default player has
         * - Hints: 256 [0, 1024]
         */
        radius: number,
    };
    FogOfWarRemoverComponent: {
        /**
         * - Hints: 140 [0, 2000]
         */
        radius: number,
    };
    GameAreaEffectComponent: {
        /**
         * what's the radius (in pixels) of the area effect
         * - Hints: 0 [0, 3.5]
         */
        radius: number,
        /**
         * the tags we're looking for
         * - Hints: hittable [0, 1]
         */
        collide_with_tag: string,
        /**
         * if not 0 will reapply this effect after this many frames have gone by
         * - Hints: -1 [0, 1]
         */
        frame_length: number,
        /**
         * just a vector of the game_effect entities
         */
        game_effect_entitities: ComponentTypeMap['VECTOR_STR'],
        /**
         */
        mEntitiesAppliedOutTo: ComponentTypeMap['VECTOR_ENTITYID'],
        /**
         */
        mEntitiesAppliedFrame: ComponentTypeMap['VECTOR_INT'],
    };
    GameEffectComponent: {
        /**
         * if 'effect' is set to 'CUSTOM', this will define effect uniqueness.
         */
        custom_effect_id: string,
        /**
         * how many frames does it affect -1 = forever
         * - Hints: -1 [0, 1]
         */
        frames: number,
        /**
         * if > 0, previous game effects with the same exclusivity group as new one will be removed when calling LoadGameEffectEntityTo
         * - Hints: 0 [0, 1]
         */
        exclusivity_group: number,
        /**
         * to disable the block message that rises
         * - Hints: 1 [0, 1]
         */
        report_block_msg: boolean,
        /**
         * if set, will disable movement
         * - Hints: 0 [0, 1]
         */
        disable_movement: boolean,
        /**
         * an entity that is loaded to each ragdoll part if 'ragdoll_effect' is set to 'CUSTOM_RAGDOLL_ENTITY'
         */
        ragdoll_effect_custom_entity_file: string,
        /**
         * if 1, 'ragdoll_effect_custom_entity_file' is loaded only to the largest piece in the ragdoll 
         * - Hints: 0 [0, 1]
         */
        ragdoll_fx_custom_entity_apply_only_to_largest_body: boolean,
        /**
         * when doing a polymorph, this is what we convert it to
         */
        polymorph_target: string,
        /**
         * polymorph stores the serialized entity here...
         */
        mSerializedData: ComponentTypeMap['USTRING'],
        /**
         * Contains a handle to the caster of this GameEffect
         * - Hints: 0 [0, 1]
         */
        mCaster: ComponentTypeMap['EntityID'],
        /**
         * Contains the herd if of the caster of this GameEffect
         * - Hints: 0 [0, 1]
         */
        mCasterHerdId: number,
        /**
         * How likely is it that we teleport, larger = less often
         * - Hints: 600 [0, 1]
         */
        teleportation_probability: number,
        /**
         * Never teleports more often that this
         * - Hints: 30 [0, 1]
         */
        teleportation_delay_min_frames: number,
        /**
         * - Hints: 128 [0, 1]
         */
        teleportation_radius_min: number,
        /**
         * - Hints: 1024 [0, 1]
         */
        teleportation_radius_max: number,
        /**
         * How many times has this GameEffectComponent teleported the owner?
         * - Hints: 0 [0, 1]
         */
        teleportations_num: number,
        /**
         * If current hp is less than this, we store it here. Then we make sure the hp never exceeds this.
         * - Hints: 3.40282e+038 [0, 1]
         */
        no_heal_max_hp_cap: ComponentTypeMap['double'],
        /**
         * Did this effect occur because someone ate something?
         * - Hints: 0 [0, 1]
         */
        caused_by_ingestion_status_effect: boolean,
        /**
         * was this caused by stains
         * - Hints: 0 [0, 1]
         */
        caused_by_stains: boolean,
        /**
         * When charmed, will try to disable CameraBound. This keeps track if we've done it, so we can enable it back
         * - Hints: 0 [0, 1]
         */
        mCharmDisabledCameraBound: boolean,
        /**
         * When charmed, will try to enable teleporting (tag:teleportable_NOT). This keeps track if we've done it, so we can disable it again
         * - Hints: 0 [0, 1]
         */
        mCharmEnabledTeleporting: boolean,
        /**
         * Are we invisible?
         * - Hints: 0 [0, 1]
         */
        mInvisible: boolean,
        /**
         * Counts stuff
         * - Hints: 0 [0, 1]
         */
        mCounter: number,
        /**
         * Counts cooldown
         * - Hints: 0 [0, 1]
         */
        mCooldown: number,
        /**
         * If 1, this is an effect extension and shouldn't create an extension when removed
         * - Hints: 0 [0, 1]
         */
        mIsExtension: boolean,
        /**
         * NOTE( Petri ): 29.4.2024 - this is used internally to make RESPAWN perk disabled in the UI
         * - Hints: 0 [0, 1]
         */
        mIsSpent: boolean,
        /**
         * GAME_EFFECT
         */
        effect: ComponentTypeMap['GAME_EFFECT::Enum'],
        /**
         * if set, will use this for ragdoll effect
         */
        ragdoll_effect: ComponentTypeMap['RAGDOLL_FX::Enum'],
        /**
         * converts to string name of the material that ragdoll is made out of
         * - Hints: 0 [0, 1]
         */
        ragdoll_material: number,
        /**
         * Status effect that caused this game effect, if any
         * - Hints: 0 [0, 1]
         */
        causing_status_effect: ComponentTypeMap['StatusEffectType'],
    };
    GameLogComponent: {
        /**
         * switches on reporting things
         * - Hints: 1 [0, 1]
         */
        report_death: boolean,
        /**
         * if set, will report when receiving damage
         * - Hints: 0 [0, 1]
         */
        report_damage: boolean,
        /**
         * if false, won't report when player enters new biomes
         * - Hints: 1 [0, 1]
         */
        report_new_biomes: boolean,
        /**
         * list of visited biomes
         */
        mVisitiedBiomes: ComponentTypeMap['VISITED_VEC'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNewBiomeCheckFrame: number,
    };
    GameStatsComponent: {
        /**
         * no one uses the name variable on entity, so we have to do this to make it happen
         */
        name: string,
        /**
         * also generated from the gunk
         */
        stats_filename: string,
        /**
         * if true, will use the session file for loading stats
         * - Hints: 0 [0, 1]
         */
        is_player: boolean,
        /**
         * set when e.g. polymorphed
         */
        extra_death_msg: string,
        /**
         * if 1, StatsLogPlayerKill must be manually called from lua
         * - Hints: 0 [0, 1]
         */
        dont_do_logplayerkill: boolean,
        /**
         * skip loading of stats if this higher than 0 and decrament this by one
         * - Hints: 0 [0, 1]
         */
        player_polymorph_count: number,
    };
    GasBubbleComponent: {
        /**
         * - Hints: -1 [-100, 0]
         */
        acceleration: number,
        /**
         * - Hints: 20 [0, 20]
         */
        max_speed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mVelocity: number,
    };
    GenomeDataComponent: {
        /**
         * Predators are considered threats by other species and hunt for food.
         * - Hints: 0 [0, 1]
         */
        is_predator: boolean,
        /**
         * 0 means king of the hill. Greater number = more likely to get eaten by other species.
         * - Hints: 0 [0, 200]
         */
        food_chain_rank: number,
        /**
         * if 1, this animal will not try to attack player who would normally be its friend
         * - Hints: 0 [0, 1]
         */
        berserk_dont_attack_friends: boolean,
        /**
         * This is used for example to separate people in different tribes.
         */
        herd_id: ComponentTypeMap['LensValue<int>'],
        /**
         * if 1, thunder mage doesn't attack this
         */
        friend_thundermage: ComponentTypeMap['LensValue<bool>'],
        /**
         * if 1, fire mage doesn't attack this
         */
        friend_firemage: ComponentTypeMap['LensValue<bool>'],
    };
    GhostComponent: {
        /**
         * pixels per second
         * - Hints: 5 [0, 1]
         */
        speed: number,
        /**
         * how often do we look for targets
         * - Hints: 0 [0, 1]
         */
        new_hunt_target_check_every: number,
        /**
         * - Hints: 512 [0, 1]
         */
        hunt_box_radius: number,
        /**
         * if higher than relations then will attack
         * - Hints: 100 [0, 1]
         */
        aggressiveness: number,
        /**
         * how far from home can we go?
         * - Hints: 300 [0, 1]
         */
        max_distance_from_home: number,
        /**
         * if set to false will die, if it can't find home
         * - Hints: 1 [0, 1]
         */
        die_if_no_home: boolean,
        /**
         * if something else (like mortal), will attack the home
         * - Hints: player_unit [0, 1]
         */
        target_tag: string,
        /**
         */
        velocity: ComponentTypeMap['vec2'],
        /**
         * where is our home?
         * - Hints: 0 [0, 1]
         */
        mEntityHome: ComponentTypeMap['EntityID'],
        /**
         * - Hints: 0 [0, 1]
         */
        mFramesWithoutHome: number,
        /**
         */
        mTargetPosition: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mTargetEntityId: number,
        /**
         */
        mRandomTarget: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextTargetCheckFrame: number,
    };
    GodInfoComponent: {
        /**
         * How much mana the player now has to use
         * - Hints: 0 [0, 1000]
         */
        mana_current: number,
        /**
         * Max size of the mana pool
         * - Hints: 500 [0, 1000]
         */
        mana_max: number,
        /**
         * How much gold the player has
         * - Hints: 0 [0, 1000]
         */
        gold: number,
        /**
         */
        god_entity: ComponentTypeMap['Entity*'],
    };
    GunComponent: {
        /**
         */
        mLuaManager: ComponentTypeMap['LuaManager*'],
    };
    HealthBarComponent: {
    };
    HitEffectComponent: {
        /**
         * Usage depends on selected 'effect_hit'
         * - Hints: 0 [0, 100]
         */
        value: number,
        /**
         * Usage depends on selected 'effect_hit'
         */
        value_string: string,
        /**
         * Hit entity needs to have this 'GAME_EFFECT' for effects to apply. If both 'condition_effect' and 'condition_status' are set, they are combined with AND logic
         */
        condition_effect: ComponentTypeMap['GAME_EFFECT::Enum'],
        /**
         * Hit entity needs to have this 'STATUS_EFFECT' for effects to apply
         * - Hints: 0 [0, 1]
         */
        condition_status: ComponentTypeMap['StatusEffectType'],
        /**
         * What kind of 'HIT_EFFECT' is applied to hit entity if condition is true
         */
        effect_hit: ComponentTypeMap['HIT_EFFECT::Enum'],
    };
    HitboxComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        is_player: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        is_enemy: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_item: boolean,
        /**
         * - Hints: -5 [-15, 15]
         */
        aabb_min_x: number,
        /**
         * - Hints: 5 [-15, 15]
         */
        aabb_max_x: number,
        /**
         * - Hints: -5 [-15, 15]
         */
        aabb_min_y: number,
        /**
         * - Hints: 5 [-15, 15]
         */
        aabb_max_y: number,
        /**
         * All damage from hits to this hitbox is multiplied with this value before applying it.
         * - Hints: 1 [0, 1]
         */
        damage_multiplier: number,
        /**
         */
        offset: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        dead: boolean,
    };
    HomingComponent: {
        /**
         * - Hints: homing_target [0, 1]
         */
        target_tag: string,
        /**
         * If 1, targets who shot the projectile, ignores 'target_tag'.
         * - Hints: 0 [0, 1]
         */
        target_who_shot: boolean,
        /**
         * - Hints: 150 [0, 1000]
         */
        detect_distance: number,
        /**
         * - Hints: 0.9 [-100, 100]
         */
        homing_velocity_multiplier: number,
        /**
         * - Hints: 160 [0, 1000]
         */
        homing_targeting_coeff: number,
        /**
         * the default accelerates towards a target. If true will only rotate towards the target.
         * - Hints: 0 [0, 1]
         */
        just_rotate_towards_target: boolean,
        /**
         * radians. If just_rotate_towards_target then this is the maximum radians it can turn per frame
         * - Hints: 0.05 [0, 6.283]
         */
        max_turn_rate: number,
        /**
         * If set, we track this entity
         * - Hints: 0 [0, 1]
         */
        predefined_target: ComponentTypeMap['EntityID'],
        /**
         * if set, will only look for entities that are _not_ child entities.
         * - Hints: 0 [0, 1]
         */
        look_for_root_entities_only: boolean,
    };
    HotspotComponent: {
        /**
         * - Hints: 1 [0, 1]
         */
        transform_with_scale: boolean,
        /**
         */
        sprite_hotspot_name: string,
        /**
         */
        offset: ComponentTypeMap['vec2'],
    };
    IKLimbAttackerComponent: {
        /**
         * - Hints: 54 [0, 1]
         */
        radius: number,
        /**
         * - Hints: 15 [0, 1]
         */
        leg_velocity_coeff: number,
        /**
         * - Hints: 120 [0, 1]
         */
        targeting_radius: number,
        /**
         * - Hints: 1 [0, 1]
         */
        targeting_raytrace: boolean,
        /**
         * - Hints: mortal [0, 1]
         */
        target_entities_with_tag: string,
        /**
         */
        mTarget: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mTargetEntity: ComponentTypeMap['EntityID'],
        /**
         */
        mState: ComponentTypeMap['IKLimbAttackerState'],
        /**
         * - Hints: 0 [0, 1]
         */
        mStateTimer: number,
    };
    IKLimbComponent: {
        /**
         * - Hints: 40 [0, 1]
         */
        length: number,
        /**
         * - Hints: 2 [0, 1]
         */
        thigh_extra_lenght: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mJointSideInterpolation: number,
        /**
         */
        end_position: ComponentTypeMap['vec2'],
        /**
         */
        mJointWorldPos: ComponentTypeMap['vec2'],
        /**
         */
        mEndPrevPos: ComponentTypeMap['vec2'],
        /**
         */
        mPart0PrevPos: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mPart0PrevRotation: number,
        /**
         */
        mPart1PrevPos: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mPart1PrevRotation: number,
    };
    IKLimbWalkerComponent: {
        /**
         * - Hints: 16 [0, 1]
         */
        ground_attachment_min_spread: number,
        /**
         * - Hints: 10 [0, 1]
         */
        ground_attachment_max_tries: number,
        /**
         * - Hints: 0.8 [0, 1]
         */
        ground_attachment_max_angle: number,
        /**
         * - Hints: 1.15 [0, 1]
         */
        ground_attachment_ray_length_coeff: number,
        /**
         * - Hints: 15 [0, 1]
         */
        leg_velocity_coeff: number,
        /**
         * if set, will cause the mFlyingTime (in CharacterDataComponent) of the parent to be 0 or 1 depending on if we're touching anything
         * - Hints: 0 [0, 1]
         */
        affect_flying: boolean,
        /**
         * 0 = detached, 1 = attached
         * - Hints: 0 [0, 1]
         */
        mState: number,
        /**
         * String name of material to not cast rays against. Defaults to 'aluminium'
         * - Hints: 0 [0, 1]
         */
        ray_skip_material: number,
        /**
         */
        mTarget: ComponentTypeMap['vec2'],
        /**
         */
        mPrevTarget: ComponentTypeMap['vec2'],
        /**
         */
        mPrevCenterPosition: ComponentTypeMap['vec2'],
    };
    IKLimbsAnimatorComponent: {
        /**
         * The number of future animation states evaluated to find the next state
         * - Hints: 10 [0, 1]
         */
        future_state_samples: number,
        /**
         * Limb raycast length is (ground_attachment_ray_length_coeff * limb length)
         * - Hints: 1.15 [0, 1]
         */
        ground_attachment_ray_length_coeff: number,
        /**
         * Limbs are moved towards target position at a pace affected by this value.
         * - Hints: 15 [0, 1]
         */
        leg_velocity_coeff: number,
        /**
         * If set, will cause the mFlyingTime (in CharacterDataComponent) of the entity to be 0 or 1 depending on if the limbs are touching ground
         * - Hints: 0 [0, 1]
         */
        affect_flying: boolean,
        /**
         * The movement score is multiplied by this value if a large move would occur
         * - Hints: 0.25 [0, 1]
         */
        large_movement_penalty_coeff: number,
        /**
         * If a limb movement would make it not collide with ground, the movement score is multiplied with this value. Use lower values to make the limbs prioritize attaching to walls.
         * - Hints: 0.75 [0, 1]
         */
        no_ground_attachment_penalty_coeff: number,
        /**
         * If 1, will apply verlet animation to simulate ragdoll-like limbs
         * - Hints: 0 [0, 1]
         */
        is_limp: boolean,
        /**
         * String name of material to not cast rays against. Defaults to 'aluminium'
         * - Hints: 0 [0, 1]
         */
        ray_skip_material: number,
        /**
         */
        mPrevBodyPosition: ComponentTypeMap['vec2'],
        /**
         */
        mLimbStates: ComponentTypeMap['IKLimbStateVec'],
        /**
         * Will be set to true if at least one leg is attached to ground.
         * - Hints: 0 [0, 1]
         */
        mHasGroundAttachmentOnAnyLeg: boolean,
    };
    IngestionComponent: {
        /**
         * How many units of material we currently store
         * - Hints: 0 [0, 1]
         */
        ingestion_size: ComponentTypeMap['int64'],
        /**
         * How many units of material we can store
         * - Hints: 7500 [0, 1]
         */
        ingestion_capacity: ComponentTypeMap['int64'],
        /**
         * How many frames is ingestion_size retained after last time eating?
         * - Hints: 600 [0, 1]
         */
        ingestion_cooldown_delay_frames: ComponentTypeMap['uint32'],
        /**
         * One unit of ingestion_size is removed every N frame
         * - Hints: 5 [0, 1]
         */
        ingestion_reduce_every_n_frame: ComponentTypeMap['uint32'],
        /**
         * How much damage per overingested cell is applied
         * - Hints: 0.002 [0, 1]
         */
        overingestion_damage: number,
        /**
         * affects healing speed if entity has HEALING_BLOOD game effect. The amount of hp restored per one blood cell.
         * - Hints: 0.0008 [0, 1000]
         */
        blood_healing_speed: number,
        /**
         * If set, only materials with this tag will increase satiation level
         */
        ingestion_satiation_material_tag: string,
        /**
         * Next frame ingestion_size cooldown can occur
         * - Hints: 0 [0, 1]
         */
        m_ingestion_cooldown_frames: ComponentTypeMap['int32'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_next_overeating_msg_frame: ComponentTypeMap['int32'],
        /**
         */
        m_ingestion_satiation_material_tag_cached: string,
        /**
         */
        m_ingestion_satiation_material_cache: ComponentTypeMap['std::set<int32>'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_damage_effect_lifetime: ComponentTypeMap['int32'],
    };
    InheritTransformComponent: {
        /**
         * if 1, we use the root of our entity hierarchy instead of the immediate parent
         * - Hints: 0 [0, 1]
         */
        use_root_parent: boolean,
        /**
         * if 1, we only inherit position. it is calculated as follows: parent_position + parent_offset * parent_scale
         * - Hints: 0 [0, 1]
         */
        only_position: boolean,
        /**
         * if set, we apply the offset of parent HotSpot with this tag
         */
        parent_hotspot_tag: string,
        /**
         * if >= 0, the Nth sprite transform in parent entity is inherited
         * - Hints: -1 [0, 1]
         */
        parent_sprite_id: number,
        /**
         * if 1, we use the immediate parent for rotation, no matter what other properties say
         * - Hints: 0 [0, 1]
         */
        always_use_immediate_parent_rotation: boolean,
        /**
         * if 1, the rotation is set to 0 deg if scale >= 0 else to 180 deg
         * - Hints: 0 [0, 1]
         */
        rotate_based_on_x_scale: boolean,
        /**
         */
        Transform: ComponentTypeMap['types::xform'],
        /**
         * - Hints: -1 [0, 1]
         */
        mUpdateFrame: number,
    };
    InteractableComponent: {
        /**
         * Distance from entity position where interaction is possible
         * - Hints: 10 [0, 1]
         */
        radius: number,
        /**
         * key or string for the text to display
         */
        ui_text: string,
        /**
         * this name is called to the on_interacted function on LuaComponents
         */
        name: string,
        /**
         * If > 0, only 1 instance of this interaction can be display at the same time
         * - Hints: 0 [0, 1]
         */
        exclusivity_group: number,
    };
    Inventory2Component: {
        /**
         * - Hints: 10 [0, 30]
         */
        quick_inventory_slots: number,
        /**
         * - Hints: 8 [0, 30]
         */
        full_inventory_slots_x: number,
        /**
         * - Hints: 8 [0, 30]
         */
        full_inventory_slots_y: number,
        /**
         * Used to retain active item across save/load. Don't touch this unless you know what you're doing!
         * - Hints: 0 [0, 1]
         */
        mSavedActiveItemIndex: ComponentTypeMap['uint32'],
        /**
         * NOTE: Don't attempt to directly change the value of this field via lua code. It will probably break the game logic in obvious or subtle ways.
         * - Hints: 0 [0, 1]
         */
        mActiveItem: ComponentTypeMap['EntityID'],
        /**
         * NOTE: Don't attempt to directly change the value of this field via lua code. It will probably break the game logic in obvious or subtle ways.
         * - Hints: 0 [0, 1]
         */
        mActualActiveItem: ComponentTypeMap['EntityID'],
        /**
         * - Hints: 0 [0, 1]
         */
        mActiveStash: ComponentTypeMap['EntityID'],
        /**
         * Is used to store the item that is being thrown, instead of mActiveItem, since the player can switch items (mActiveItem) during the throwing animation
         * - Hints: 0 [0, 1]
         */
        mThrowItem: ComponentTypeMap['EntityID'],
        /**
         * - Hints: 0 [0, 1]
         */
        mItemHolstered: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mInitialized: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mForceRefresh: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mDontLogNextItemEquip: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mSmoothedItemXOffset: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mLastItemSwitchFrame: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mIntroEquipItemLerp: number,
        /**
         */
        mSmoothedItemAngleVec: ComponentTypeMap['vec2'],
    };
    InventoryComponent: {
        /**
         * UI_CONTAINER_TYPES enum
         * - Hints: 1 [0, 1]
         */
        ui_container_type: number,
        /**
         * ui back sprite
         * - Hints: data/ui_gfx/inventory/inventory_box.png [0, 1]
         */
        ui_element_sprite: string,
        /**
         * list of actions, used for serialization
         */
        actions: string,
        /**
         * ui size, how many items x*y we can fit in
         */
        ui_container_size: ComponentTypeMap['ivec2'],
        /**
         * ui size
         */
        ui_element_size: ComponentTypeMap['ivec2'],
        /**
         * where do we load this on screen
         */
        ui_position_on_screen: ComponentTypeMap['ivec2'],
        /**
         * listener to keep ui up with ability changes
         */
        update_listener: ComponentTypeMap['InvenentoryUpdateListener*'],
        /**
         */
        items: ComponentTypeMap['INVENTORYITEM_VECTOR'],
    };
    InventoryGuiComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        has_opened_inventory_edit: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        wallet_money_target: number,
        /**
         * hax, don't touch!
         * - Hints: 0 [0, 1]
         */
        mDisplayFireRateWaitBar: boolean,
        /**
         */
        imgui: ComponentTypeMap['ImGuiContext*'],
        /**
         * - Hints: -100 [0, 1]
         */
        mLastFrameInteracted: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mLastFrameActionsVisible: number,
        /**
         */
        mLastPurchasedAction: ComponentTypeMap['Entity*'],
        /**
         * - Hints: 0 [0, 1]
         */
        mActive: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        mAlpha: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mBackgroundOverlayAlpha: number,
        /**
         * for animations of shaking them bars
         * - Hints: 0 [0, 1]
         */
        mFrameShake_ReloadBar: number,
        /**
         * for animations of shaking them bars
         * - Hints: 0 [0, 1]
         */
        mFrameShake_ManaBar: number,
        /**
         * for animations of shaking them bars
         * - Hints: 0 [0, 1]
         */
        mFrameShake_FlyBar: number,
        /**
         * for animations of shaking them bars
         * - Hints: 0 [0, 1]
         */
        mFrameShake_FireRateWaitBar: number,
    };
    ItemAIKnowledgeComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        is_ranged_weapon: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_throwable_weapon: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_melee_weapon: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_self_healing: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_other_healing: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_self_buffing: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_other_buffing: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_weapon: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_known: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        is_safe: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_consumed: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        never_use: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        ranged_min_distance: number,
    };
    ItemActionComponent: {
        /**
         * the name ID of the action
         */
        action_id: string,
    };
    ItemAlchemyComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        material_make_always_cast: number,
        /**
         * - Hints: 0 [0, 1]
         */
        material_remove_shuffle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        material_animate_wand: number,
        /**
         * - Hints: 0 [0, 1]
         */
        material_animate_wand_alt: number,
        /**
         * - Hints: 0 [0, 1]
         */
        material_increase_uses_remaining: number,
        /**
         * - Hints: 0 [0, 1]
         */
        material_sacrifice: number,
    };
    ItemChestComponent: {
        /**
         * - Hints: 0 [0, 1e+006]
         */
        item_count_min: number,
        /**
         * - Hints: 0 [0, 1e+006]
         */
        item_count_max: number,
        /**
         * - Hints: 0 [0, 1e+006]
         */
        level: number,
        /**
         * enemy_drop, if set will modify the item_count_min, item_count_max...
         * - Hints: 0 [0, 1]
         */
        enemy_drop: boolean,
        /**
         * e.g. 'bullet,bullet,damage' ... actions are parsed into a string
         */
        actions: string,
        /**
         * e.g. '10,10,-1' ... action uses remaining counts are parsed into a string
         */
        action_uses_remaining: string,
        /**
         * file names of other entities we should spawn from this chest, comma separated
         */
        other_entities_to_spawn: string,
        /**
         * this is used to figure out what we spawn from this chest
         * - Hints: 0 [0, 1]
         */
        mSeed: ComponentTypeMap['unsigned int'],
    };
    ItemComponent: {
        /**
         * the name of the item
         */
        item_name: string,
        /**
         * does this item stack on other items the same 'item_name' in the inventory?
         * - Hints: 0 [0, 1]
         */
        is_stackable: boolean,
        /**
         * if 1, using this item will reduce 'uses_remaining'. When it reaches zero the item is destroyed
         * - Hints: 0 [0, 1]
         */
        is_consumable: boolean,
        /**
         * does this count as an item that was picked up in the stats
         * - Hints: 1 [0, 1]
         */
        stats_count_as_item_pick_up: boolean,
        /**
         * if 1, item will be automatically picked up, no pickup hint is shown
         * - Hints: 0 [0, 1]
         */
        auto_pickup: boolean,
        /**
         * if 1, this item can't be removed from a container once it is put inside one
         * - Hints: 0 [0, 1]
         */
        permanently_attached: boolean,
        /**
         * how many times can this item be used? -1 = unlimited, will be reset to gun_actions.lua max_uses by inventorygui_system, -2 = unlimited unlimited
         * - Hints: -1 [0, 1]
         */
        uses_remaining: number,
        /**
         * is it known what this item does?
         * - Hints: 1 [0, 1]
         */
        is_identified: boolean,
        /**
         * if 1, this item can't be modified or moved from a wand
         * - Hints: 0 [0, 1]
         */
        is_frozen: boolean,
        /**
         * does player keep this item when respawning?
         * - Hints: 0 [0, 1]
         */
        collect_nondefault_actions: boolean,
        /**
         * is this entity destroyed when it's in an inventory and the inventory owner dies?
         * - Hints: 0 [0, 1]
         */
        remove_on_death: boolean,
        /**
         * is this entity destroyed when it's in an inventory, empty and the inventory owner dies?
         * - Hints: 0 [0, 1]
         */
        remove_on_death_if_empty: boolean,
        /**
         * if true, the default AbilityComponent.child_actions in this items will be removed when it dies
         * - Hints: 0 [0, 1]
         */
        remove_default_child_actions_on_death: boolean,
        /**
         * if 1, the item will play a hovering animation
         * - Hints: 0 [0, 1]
         */
        play_hover_animation: boolean,
        /**
         * if 1, the item will play a spinning animation, if player_hover_animation is 0
         * - Hints: 1 [0, 1]
         */
        play_spinning_animation: boolean,
        /**
         * if 1, the default logic for determining if an item can be equiped in inventory is overridden and this can be always equipped
         * - Hints: 0 [0, 1]
         */
        is_equipable_forced: boolean,
        /**
         * if 1, plays a default sound when picked
         * - Hints: 1 [0, 1]
         */
        play_pick_sound: boolean,
        /**
         * if 0 you cannot drink this, default is 1, because that's how it was implemented and backwards compatibility
         * - Hints: 1 [0, 1]
         */
        drinkable: boolean,
        /**
         * number of items this can hold inside itself. TODO: get rid of all uses of 'ability->gun_config.deck_capacity' and replace them with this!
         * - Hints: 0 [0, 1]
         */
        max_child_items: number,
        /**
         * sprite displayed for the item in various UIs. If not empty overrides sprites declared by Ability and ItemAction
         */
        ui_sprite: string,
        /**
         * item description displayed in various UIs
         */
        ui_description: string,
        /**
         * - Hints: 0 [0, 1]
         */
        enable_orb_hacks: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_all_spells_book: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        always_use_item_name_in_ui: boolean,
        /**
         * if set, this is used for the 'Press $0 to pick $1' message
         */
        custom_pickup_string: string,
        /**
         * - Hints: 0 [0, 1]
         */
        ui_display_description_on_pick_up_hint: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        next_frame_pickable: number,
        /**
         * NPC have their own next_frame_pickable, because this is used to make NPCs not pick up gold, which also meant player couldn't pick up that gold
         * - Hints: 0 [0, 1]
         */
        npc_next_frame_pickable: number,
        /**
         * can this be picked up and placed on someone's inventory
         * - Hints: 1 [0, 1]
         */
        is_pickable: boolean,
        /**
         * to override the weirdness that is is_pickable, which affects if this is hittable or not. If true, will always be hittable regardless of is_pickable
         * - Hints: 0 [0, 1]
         */
        is_hittable_always: boolean,
        /**
         * how many pixels away can this item be picked up from
         * - Hints: 14.1 [0, 1]
         */
        item_pickup_radius: number,
        /**
         * how far can we move the camera from the player when this item is equipped
         * - Hints: 50 [0, 1]
         */
        camera_max_distance: number,
        /**
         * how quickly does the camera follow player?
         * - Hints: 1 [0, 1]
         */
        camera_smooth_speed_multiplier: number,
        /**
         * - Hints: 0 [0, 1]
         */
        has_been_picked_by_player: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mFramePickedUp: number,
        /**
         * the position where this item spawned
         */
        spawn_pos: ComponentTypeMap['vec2'],
        /**
         * Which inventory do we go to when we're picked up, if it's not full.
         */
        preferred_inventory: ComponentTypeMap['INVENTORY_KIND::Enum'],
        /**
         * our preferred slot (x,y) in the inventory
         */
        inventory_slot: ComponentTypeMap['ivec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mItemUid: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mIsIdentified: boolean,
    };
    ItemCostComponent: {
        /**
         * - Hints: 100 [0, 3500]
         */
        cost: ComponentTypeMap['int64'],
        /**
         * if set - will check that it's within an area called shop
         * - Hints: 0 [0, 1]
         */
        stealable: boolean,
        /**
         * used to change the text on the sprite
         * - Hints: -1 [0, 1]
         */
        mExCost: ComponentTypeMap['int64'],
    };
    ItemPickUpperComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        is_in_npc: boolean,
        /**
         * If true, will pick up _any_ item. Breaks all kinds of things, but maybe mods will find this fun to mess around with
         * - Hints: 0 [0, 1]
         */
        pick_up_any_item_buggy: boolean,
        /**
         * if set, won't drop the wand if kicked. Mainly used by wand ghosts.
         * - Hints: 0 [0, 1]
         */
        is_immune_to_kicks: boolean,
        /**
         * picks up this entity and only this entity. Overrides the is_in_npc checks that try to limit things to pickuppable wands
         * - Hints: 0 [0, 1]
         */
        only_pick_this_entity: ComponentTypeMap['EntityID'],
        /**
         * if true, will drop all items. E.g. if true for player, player drops their wands
         * - Hints: 1 [0, 1]
         */
        drop_items_on_death: boolean,
        /**
         */
        mLatestItemOverlapInfoBoxPosition: ComponentTypeMap['vec2'],
    };
    ItemRechargeNearGroundComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMPY: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
    };
    ItemStashComponent: {
        /**
         * - Hints: 30 [0, 180]
         */
        throw_openable_cooldown_frames: number,
        /**
         * - Hints: 1 [0, 1]
         */
        init_children: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrameOpenable: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mFrameOpened: number,
    };
    KickComponent: {
        /**
         * e.g. telekinetic kick disables this
         * - Hints: 1 [0, 1]
         */
        can_kick: boolean,
        /**
         * - Hints: 3 [0, 3.5]
         */
        kick_radius: number,
        /**
         * this is here, so that STRONG_KICK -perk can affect telekinetic kick as well
         * - Hints: 25 [0, 1]
         */
        telekinesis_throw_speed: number,
        /**
         * comma separated list of entities that are loaded when player kicks
         */
        kick_entities: string,
        /**
         */
        max_force: ComponentTypeMap['LensValue<float>'],
        /**
         */
        player_kickforce: ComponentTypeMap['LensValue<float>'],
        /**
         * ( 1.f / 25.f )
         */
        kick_damage: ComponentTypeMap['LensValue<float>'],
        /**
         * knockback force for entities
         */
        kick_knockback: ComponentTypeMap['LensValue<float>'],
    };
    LaserEmitterComponent: {
        /**
         * If 1, will emit all the time
         * - Hints: 1 [0, 1]
         */
        is_emitting: boolean,
        /**
         * Can be used to activate a laser temporarily
         * - Hints: -1 [0, 1]
         */
        emit_until_frame: ComponentTypeMap['int32'],
        /**
         * Beam angle = entity angle + laser_angle_add_rad
         * - Hints: 0 [0, 1]
         */
        laser_angle_add_rad: number,
        /**
         */
        laser: ComponentTypeMap['ConfigLaser'],
    };
    LevitationComponent: {
        /**
         * the radius in which we look for entities / bodies to float
         * - Hints: 20 [1, 50]
         */
        radius: number,
        /**
         * how much do we apply the mouse movements to the entitiy
         * - Hints: 0.3 [0, 1]
         */
        entity_force: number,
        /**
         * how much do we apply the mouse movements to the entitiy
         * - Hints: 0.3 [0, 1]
         */
        box2d_force: number,
        /**
         * - Hints: 600 [1, 600]
         */
        effect_lifetime_frames: number,
    };
    LifetimeComponent: {
        /**
         * if anything else than -1 will kill this entity when this many frames have passed
         * - Hints: -1 [0, 1]
         */
        lifetime: number,
        /**
         * if 1, sprites will be faded as lifetime gets lower
         * - Hints: 0 [0, 1]
         */
        fade_sprites: boolean,
        /**
         * if 1, will kill the parent entity
         * - Hints: 0 [0, 1]
         */
        kill_parent: boolean,
        /**
         * if 1, will kill all the parents entity
         * - Hints: 0 [0, 1]
         */
        kill_all_parents: boolean,
        /**
         * if 1, will retain kill_frame and creation_frame over serialization
         * - Hints: 0 [0, 1]
         */
        serialize_duration: boolean,
        /**
         * frame that this is killed at
         * - Hints: 0 [0, 1]
         */
        kill_frame_serialized: number,
        /**
         * frame that this is killed at
         * - Hints: 0 [0, 1]
         */
        creation_frame_serialized: number,
        /**
         * this is added to the lifetime
         */
        randomize_lifetime: ComponentTypeMap['ValueRange'],
        /**
         * we'll set this to GG.GetFrameNum() when this component is created
         * - Hints: 0 [0, 1]
         */
        creation_frame: number,
        /**
         * frame that this is killed at
         * - Hints: 0 [0, 1]
         */
        kill_frame: number,
    };
    LightComponent: {
        /**
         * turn this on if you expect this to function like the other components
         * - Hints: 0 [0, 1]
         */
        update_properties: boolean,
        /**
         * The radius of the light in world pixels.
         * - Hints: 0 [0, 3000]
         */
        radius: number,
        /**
         * Color red 0-255
         * - Hints: 255 [0, 255]
         */
        r: ComponentTypeMap['unsigned int'],
        /**
         * Color green 0-255
         * - Hints: 178 [0, 255]
         */
        g: ComponentTypeMap['unsigned int'],
        /**
         * Color blue 0-255
         * - Hints: 118 [0, 255]
         */
        b: ComponentTypeMap['unsigned int'],
        /**
         * Offset from the center of entity.
         * - Hints: 0 [-3000, 3000]
         */
        offset_x: number,
        /**
         * Offset from the center of entity.
         * - Hints: 0 [-3000, 3000]
         */
        offset_y: number,
        /**
         * time in seconds, if not 0, this is how long this takes to die, when the component is destroyed
         * - Hints: 0 [0, 5]
         */
        fade_out_time: number,
        /**
         * if less than 1, will blink randomly when rand() < blinking_freq
         * - Hints: 1 [0, 1]
         */
        blinking_freq: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mAlpha: number,
        /**
         */
        mSprite: ComponentTypeMap['as::Sprite*'],
    };
    LightningComponent: {
        /**
         * particle effect, from where the file is loaded that lightning is generated from
         * - Hints: data/particles/lightning_ray.png [0, 1]
         */
        sprite_lightning_file: string,
        /**
         * if this is true, it's a projectile lightning and looks for ProjectileComponent and uses the data from there to move it
         * - Hints: 0 [0, 1]
         */
        is_projectile: boolean,
        /**
         * 1 = lightning trail
         * - Hints: 1 [0, 1]
         */
        explosion_type: number,
        /**
         * remaining number of frames the arc exists
         * - Hints: 60 [0, 1]
         */
        arc_lifetime: number,
        /**
         */
        config_explosion: ComponentTypeMap['ConfigExplosion'],
        /**
         * stores the ex position of this entity
         */
        mExPosition: ComponentTypeMap['vec2'],
        /**
         * if 'mArcTarget' points to an existing entity a lighting arc will be created between this entity and 'mArcTarget'
         * - Hints: 0 [0, 1]
         */
        mArcTarget: ComponentTypeMap['EntityID'],
    };
    LimbBossComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        state: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mStatePrev: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mMoveToPositionX: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mMoveToPositionY: number,
    };
    LiquidDisplacerComponent: {
        /**
         * - Hints: 1 [0, 20]
         */
        radius: number,
        /**
         * - Hints: 30 [0, 100]
         */
        velocity_x: number,
        /**
         * - Hints: 30 [0, 100]
         */
        velocity_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPrevX: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPrevY: number,
    };
    LoadEntitiesComponent: {
        /**
         * path to the entity file we should load
         */
        entity_file: string,
        /**
         * if 1, we kill our entity when it is created
         * - Hints: 1 [0, 1]
         */
        kill_entity: boolean,
        /**
         * for timer
         * - Hints: 0 [0, 180]
         */
        timeout_frames: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mTimerTriggerFrame: number,
        /**
         * how many entities should be loaded (random range)
         */
        count: ComponentTypeMap['ValueRangeInt'],
    };
    LocationMarkerComponent: {
        /**
         * - Hints: 0 [0, 3]
         */
        id: number,
    };
    LooseGroundComponent: {
        /**
         * how often do we do this... shoots a ray in random direction and does the loosening
         * - Hints: 0 [0, 1]
         */
        probability: number,
        /**
         * if material durability > max_durability, it is not loosened
         * - Hints: 2147483647 [0, 1]
         */
        max_durability: number,
        /**
         * how far raytraces to find things to loosen up
         * - Hints: 256 [0, 1]
         */
        max_distance: number,
        /**
         * how much raytraces go to different directions around the up-vector. pi=full circle
         * - Hints: 1.57 [0, 1]
         */
        max_angle: number,
        /**
         * the minimum radius of our loosening of pixels
         * - Hints: 3 [0, 1]
         */
        min_radius: number,
        /**
         * the maximum radius of our loosening of pixels
         * - Hints: 8 [0, 1]
         */
        max_radius: number,
        /**
         * if > 0, will drop box2d chunks of the ceiling
         * - Hints: 0 [0, 1]
         */
        chunk_probability: number,
        /**
         * how much raytraces go to different directions around the up-vector. pi=full circle
         * - Hints: 0.7 [0, 1]
         */
        chunk_max_angle: number,
        /**
         * how many chunks are we allowed to do, -1 = infinite
         * - Hints: -1 [0, 1]
         */
        chunk_count: number,
        /**
         * loads these files randomly to do the collapse shapes
         * - Hints: data/procedural_gfx/collapse_big/$[0-14].png [0, 1]
         */
        collapse_images: string,
        /**
         * String name of chunk material
         * - Hints: 0 [0, 1]
         */
        chunk_material: number,
        /**
         * how many chunks are we allowed to do, -1 = infinite
         * - Hints: 0 [0, 1]
         */
        mChunkCount: number,
    };
    LuaComponent: {
        /**
         */
        script_source_file: string,
        /**
         * - Hints: 0 [0, 1]
         */
        execute_on_added: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        execute_on_removed: boolean,
        /**
         * 1 = execute every frame. 2 = execute every second frame. 3 = execute every third frame and so on. -1 = execute only on add/remove/event
         * - Hints: 1 [1, 150]
         */
        execute_every_n_frame: number,
        /**
         * How many times should the script be executed? < 1 means infinite
         * - Hints: 0 [0, 1]
         */
        execute_times: number,
        /**
         * -1 = infinite. Use this to limit how many times this can be executed per frame. Currently only used to limit script_shot from being executed forever.
         * - Hints: -1 [0, 1]
         */
        limit_how_many_times_per_frame: number,
        /**
         * -1 = no limit. Currently only used to limit script_shot from being executed every frame.
         * - Hints: -1 [0, 1]
         */
        limit_to_every_n_frame: number,
        /**
         * NOTE( Petri ): 19.8.2023 - by default limit_how_many_times_per_frame and limit_to_every_n_frame only works for script_shot. If this is set to true, will limit all callbacks. Also note that this limit is shared within this component. So if this is true and both script_shot and script_damage_received and both are called within limit_to_every_n_frame frames, only one of them will be called.
         * - Hints: 0 [0, 1]
         */
        limit_all_callbacks: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        remove_after_executed: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        enable_coroutines: boolean,
        /**
         *  if 1, calls function init( entity_id:int ) after running the code in the file scope of script_source_file along with all mod appends. Does nothing if execute_on_added is 0
         * - Hints: 0 [0, 1]
         */
        call_init_function: boolean,
        /**
         * if set, calls function 'enabled_changed( entity_id:int, is_enabled:bool )' when the IsEnabled status of this LuaComponent is changed
         */
        script_enabled_changed: string,
        /**
         * if set, calls function 'damage_received( damage:number, message:string, entity_thats_responsible:int, is_fatal:bool, projectile_thats_responsible:int )' when we receive a message about damage (Message_DamageReceived)
         */
        script_damage_received: string,
        /**
         * if set, calls function 'damage_about_to_be_received( damage:number, x:number, y:number, entity_thats_responsible:int, critical_hit_chance:int )' when we receive a message (Message_DamageAboutToBeReceived) -> new_damage:number,new_critical_hit_chance:int
         */
        script_damage_about_to_be_received: string,
        /**
         * if set, calls function 'item_pickup( int entity_item, int entity_pickupper, string item_name )' when message 'Message_ItemPickUp' is called
         */
        script_item_picked_up: string,
        /**
         * if set, calls function 'shot( projectile_entity_id )' when we receive Message_Shot
         */
        script_shot: string,
        /**
         * if set, calls function 'collision_trigger( colliding_entity_id )' when we receive Message_CollisionTriggerHit
         */
        script_collision_trigger_hit: string,
        /**
         * if set, calls function 'collision_trigger_timer_finished()' when we receive Message_CollisionTriggerTimerFinished
         */
        script_collision_trigger_timer_finished: string,
        /**
         * if set, calls function 'physics_body_modified( is_destroyed )' when physics body has been modified
         */
        script_physics_body_modified: string,
        /**
         * if set, calls function 'pressure_plate_change( new_state )' when PressurePlateComponent decides that things have change
         */
        script_pressure_plate_change: string,
        /**
         * if set, calls function 'inhaled_material( material_name, count )' once per second for each inhaled material
         */
        script_inhaled_material: string,
        /**
         * if set, calls function 'death( int damage_type_bit_field, string damage_message, int entity_thats_responsible, bool drop_items )' when we receive message Message_Death
         */
        script_death: string,
        /**
         * if set, calls function 'throw_item( from_x, from_y, to_x, to_y )' when we receive message Message_ThrowItem
         */
        script_throw_item: string,
        /**
         * if set, calls function 'material_area_checker_failed( pos_x, pos_y, )' when we receive message Message_MaterialAreaCheckerFailed
         */
        script_material_area_checker_failed: string,
        /**
         * if set, calls function 'material_area_checker_success( pos_x, pos_y, )' when we receive message Message_MaterialAreaCheckerSuccess
         */
        script_material_area_checker_success: string,
        /**
         * if set, calls function 'electricity_receiver_switched( bool is_electrified )' when we receive message Message_ElectricityReceiverSwitched
         */
        script_electricity_receiver_switched: string,
        /**
         * if set, calls function 'electricity_receiver_electrified()' when we receive message Message_ElectricityReceiverElectrified
         */
        script_electricity_receiver_electrified: string,
        /**
         * if set, calls function 'kick( entity_who_kicked )' when we receive message Message_Kick
         */
        script_kick: string,
        /**
         * if set, calls function 'interacting( entity_who_interacted, entity_interacted, interactable_name )' when we receive message Message_Interaction
         */
        script_interacting: string,
        /**
         * if set, calls function 'audio_event_dead( bank_file, event_root )' when we receive message Message_AudioEventDead
         */
        script_audio_event_dead: string,
        /**
         * if set, calls function 'wand_fired( gun_entity_id )' when we receive Message_WandFired
         */
        script_wand_fired: string,
        /**
         * if set, calls function 'teleported( from_x, from_y, to_x, to_y, bool portal_teleport )' when we receive Message_Teleported
         */
        script_teleported: string,
        /**
         * if set, calls function 'portal_teleport_used( entity_that_was_teleported, from_x, from_y, to_x, to_y )' when we receive Message_PortalTeleportUsed
         */
        script_portal_teleport_used: string,
        /**
         * if set, calls function 'polymorphing_to( string_entity_we_are_about_to_polymorph_to )' when we receive Message_PolymorphingTo
         */
        script_polymorphing_to: string,
        /**
         * if set, calls function 'biome_entered( string_biome_name, string_biome_old_name )' when this entity changes biomes. Requires BiomeTrackerComponent
         */
        script_biome_entered: string,
        /**
         * - Hints: -1 [0, 1]
         */
        mLastExecutionFrame: number,
        /**
         * tracks how many times we've executed this frame. This will linger on and store the old value of the old frames. Used internally.
         * - Hints: 0 [0, 1]
         */
        mTimesExecutedThisFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mModAppendsDone: boolean,
        /**
         * Do we share a single Lua virtual machine for everyone who runs 'script_source_file' ('SHARED_BY_MANY_COMPONENTS'), create one VM per one LuaComponent and reuse the VM in case the component runs the script multiple times ('ONE_PER_COMPONENT_INSTANCE'), or create a new VM every time the script is executed ('CREATE_NEW_EVERY_EXECUTION', deprecated)?
         */
        vm_type: ComponentTypeMap['LUA_VM_TYPE::Enum'],
        /**
         * - Hints: -1 [0, 1]
         */
        mNextExecutionTime: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mTimesExecuted: number,
        /**
         */
        mLuaManager: ComponentTypeMap['LuaManager*'],
        /**
         */
        mPersistentValues: ComponentTypeMap['ValueMap'],
    };
    MagicConvertMaterialComponent: {
        /**
         * - Hints: 256 [0, 512]
         */
        radius: number,
        /**
         * allows for convert to happen from x pixels from the center
         * - Hints: 0 [0, 512]
         */
        min_radius: number,
        /**
         * - Hints: 0 [0, 1]
         */
        is_circle: boolean,
        /**
         * - Hints: 10 [0, 512]
         */
        steps_per_frame: number,
        /**
         * the tag of material, e.g. [liquid]
         */
        from_material_tag: string,
        /**
         * if 1, converts any cells of any material to 'to_materia'
         * - Hints: 0 [0, 1]
         */
        from_any_material: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        clean_stains: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        extinguish_fire: boolean,
        /**
         * if > 0, will call UpdateFire() fan_the_flames times
         * - Hints: 0 [0, 1]
         */
        fan_the_flames: number,
        /**
         * if != 0, will use the 'cold_freezes_to_materials' and 'warmth_melts_to_materials' in CellData to convert cells different materials
         * - Hints: 0 [0, 1]
         */
        temperature_reaction_temp: ComponentTypeMap['int32'],
        /**
         * if > 0, will call Ignite() with ingite_materials as probability_of_fire
         * - Hints: 0 [0, 1]
         */
        ignite_materials: number,
        /**
         * - Hints: 0 [0, 1]
         */
        loop: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        kill_when_finished: boolean,
        /**
         * if 1, kills entities with a damagemodel and converts them to 'to_material'
         * - Hints: 0 [0, 1]
         */
        convert_entities: boolean,
        /**
         * petri hax
         * - Hints: 0 [0, 1]
         */
        stain_frozen: boolean,
        /**
         * if > 0, will generate chemical reaction audio at converted cells
         * - Hints: 0 [0, 1]
         */
        reaction_audio_amount: number,
        /**
         * 9.10.2020 - added this because at the end this caused the 'white ring' to appear, set it to false if you don't want constant whiteout
         * - Hints: 1 [0, 1]
         */
        convert_same_material: boolean,
        /**
         */
        from_material_array: string,
        /**
         */
        to_material_array: string,
        /**
         * - Hints: 0 [0, 512]
         */
        mRadius: number,
        /**
         * - Hints: 0 [0, 1]
         */
        from_material: number,
        /**
         * - Hints: 0 [0, 1]
         */
        to_material: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mUseArrays: boolean,
        /**
         */
        mFromMaterialArray: ComponentTypeMap['std::vector<int>'],
        /**
         */
        mToMaterialArray: ComponentTypeMap['std::vector<int>'],
    };
    MagicXRayComponent: {
        /**
         * - Hints: 256 [0, 512]
         */
        radius: number,
        /**
         * - Hints: 10 [0, 512]
         */
        steps_per_frame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStep: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mRadius: number,
    };
    ManaReloaderComponent: {
    };
    MaterialAreaCheckerComponent: {
        /**
         * if something other than 0 or 1, will only update_every_x_frames 
         * - Hints: 0 [0, 1]
         */
        update_every_x_frame: number,
        /**
         * if true, will send message Message_MaterialAreaCheckerFailed if the material doesn't exist. If false, will send a message Message_MaterialAreaCheckerSuccess if the aabb is full of material and material2
         * - Hints: 1 [0, 1]
         */
        look_for_failure: boolean,
        /**
         * If > 0, and look_for_failure=0, will send message if material count exceeds this number of cells
         * - Hints: 0 [0, 1]
         */
        count_min: number,
        /**
         * if 1, and look_for_failure=0, will always check the whole area for cells
         * - Hints: 0 [0, 1]
         */
        always_check_fullness: boolean,
        /**
         * will kill this entity after sending the message
         * - Hints: 1 [0, 1]
         */
        kill_after_message: boolean,
        /**
         * aabb offset, we check that this aabb contains only material
         */
        area_aabb: ComponentTypeMap['types::aabb'],
        /**
         * String name of material that we check that the aabb contains
         * - Hints: 0 [0, 1]
         */
        material: number,
        /**
         * String name of material2 that we check that the aabb contains
         * - Hints: 0 [0, 1]
         */
        material2: number,
        /**
         * keeps track where we are
         * - Hints: 0 [0, 1]
         */
        mPosition: number,
        /**
         * keeps track of how often we've checked
         * - Hints: 0 [0, 1]
         */
        mLastFrameChecked: number,
    };
    MaterialInventoryComponent: {
        /**
         * if true, drops a bag that the player can big up
         * - Hints: 1 [0, 1]
         */
        drop_as_item: boolean,
        /**
         * if true, on the death this will explode all the materials into air
         * - Hints: 0 [0, 1]
         */
        on_death_spill: boolean,
        /**
         * NOTE( Petri ): 11.8.2023 - set this to false for old style leaky hidden piles situation.
         * - Hints: 1 [0, 1]
         */
        leak_gently: boolean,
        /**
         * if higher than 0 then it might leak when projectile damage happens
         * - Hints: 0 [0, 1]
         */
        leak_on_damage_percent: number,
        /**
         * leak pressure coefficient
         * - Hints: 0.7 [0, 1]
         */
        leak_pressure_min: number,
        /**
         * leak pressure coefficient
         * - Hints: 1.1 [0, 1]
         */
        leak_pressure_max: number,
        /**
         * the minimum damage that has to be done in order for a leak to occur
         * - Hints: 0.09 [0, 1]
         */
        min_damage_to_leak: number,
        /**
         * if 0, nothing happens, elsewise will add a b2 force to the particleemitter which will push the b2body
         * - Hints: 0 [0, 10]
         */
        b2_force_on_leak: number,
        /**
         * how far do we throw material particles on death?
         * - Hints: 1 [0, 1]
         */
        death_throw_particle_velocity_coeff: number,
        /**
         * if set, will send MessageDeath when materials are drained
         * - Hints: 0 [0, 1]
         */
        kill_when_empty: boolean,
        /**
         * if true, will multiply the materials with the given halftimes
         * - Hints: 0 [0, 1]
         */
        halftime_materials: boolean,
        /**
         * NOTE( Petri ): 15.8.2023 - if > 0, will do CellReactions between the materials. Value is the percent chance of how often. 100 = every frame 
         * - Hints: 0 [0, 100]
         */
        do_reactions: number,
        /**
         * requires do_reactions > 0 - are we allowed to do reaction explosions?
         * - Hints: 0 [0, 1]
         */
        do_reactions_explosions: boolean,
        /**
         * requires do_reactions > 0 - are we allowed to load entities when doing reactions?
         * - Hints: 0 [0, 1]
         */
        do_reactions_entities: boolean,
        /**
         * Note( Petri ): 17.8.2023 - how 'fast' do we let reactions happen. How many pixels of material do we convert at one time (5-10) seems like a nice speed.
         * - Hints: 5 [0, 1]
         */
        reaction_speed: number,
        /**
         * Note( Petri ): 17.8.2023 - added the ability of shaking the bottle to cause reactions to happen quicker. 
         * - Hints: 1 [0, 1]
         */
        reactions_shaking_speeds_up: boolean,
        /**
         * how much materials we can store in total. < 0 = infinite
         * - Hints: -1 [0, 1]
         */
        max_capacity: ComponentTypeMap['double'],
        /**
         * if > 0, 'fullness of this container' * 'audio_collision_size_modifier_amount' is added to collision audio event size
         * - Hints: 0 [0, 1]
         */
        audio_collision_size_modifier_amount: number,
        /**
         * last frame someone ingested from this via IngestionSystem
         * - Hints: -100 [0, 1]
         */
        last_frame_drank: ComponentTypeMap['int32'],
        /**
         * Count of each material indexed by material type ID
         */
        count_per_material_type: ComponentTypeMap['MATERIAL_VEC_DOUBLES'],
        /**
         * - Hints: 0 [0, 1]
         */
        is_death_handled: boolean,
        /**
         * used to figure out movement velocity
         */
        ex_position: ComponentTypeMap['vec2'],
        /**
         * used to figure out movement velocity
         * - Hints: 0 [0, 1]
         */
        ex_angle: number,
    };
    MaterialSeaSpawnerComponent: {
        /**
         * How many pixels to cover per one direction per one frame
         * - Hints: 10 [1, 100]
         */
        speed: number,
        /**
         * Parameters for sine wave that affects material spawn pattern
         * - Hints: 10 [0, 2]
         */
        sine_wavelength: number,
        /**
         * Parameters for sine wave that affects material spawn pattern
         * - Hints: 5 [0, 2]
         */
        sine_amplitude: number,
        /**
         * Parameters for noise that affects material spawn pattern
         * - Hints: 0.1 [0, 1]
         */
        noise_scale: ComponentTypeMap['double'],
        /**
         * Parameters for noise that affects material spawn pattern
         * - Hints: 0.05 [0, 1]
         */
        noise_threshold: ComponentTypeMap['double'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_position: number,
        /**
         * to help keep the effect
         * - Hints: 0 [0, 1]
         */
        frames_run: number,
        /**
         * String name of material this creates
         * - Hints: 0 [0, 1]
         */
        material: number,
        /**
         * Size of the area to cover
         */
        size: ComponentTypeMap['ivec2'],
        /**
         * Offset of the center of the area to cover
         */
        offset: ComponentTypeMap['ivec2'],
    };
    MaterialSuckerComponent: {
        /**
         * 0 = liquid, 1 = sand, 2 = gas (arbitary order)
         * - Hints: 0 [0, 3]
         */
        material_type: number,
        /**
         * how many pixels can we suck up
         * - Hints: 50 [0, 1024]
         */
        barrel_size: number,
        /**
         * How many cells at max can we suck per frame?
         * - Hints: 1 [0, 5]
         */
        num_cells_sucked_per_frame: number,
        /**
         * if set, will set the projectile what ever we're sucking...?
         * - Hints: 0 [0, 1]
         */
        set_projectile_to_liquid: boolean,
        /**
         * hax... this is set if we use set_projectile_to_liquid
         * - Hints: 0 [0, 1]
         */
        last_material_id: number,
        /**
         * if set will just suck gold and update wallet
         * - Hints: 0 [0, 1]
         */
        suck_gold: boolean,
        /**
         * if set will just suck healthium material and add 1 hp every sucked healthium
         * - Hints: 0 [0, 1]
         */
        suck_health: boolean,
        /**
         * will suck static materials from the world
         * - Hints: 0 [0, 1]
         */
        suck_static_materials: boolean,
        /**
         * if set, will only suck materials with this tag. NOTE, will also require the correct material_type to be set
         */
        suck_tag: string,
        /**
         * how full are we
         * - Hints: 0 [0, 1]
         */
        mAmountUsed: number,
        /**
         * random offset for pos, where we look for pixels
         */
        randomized_position: ComponentTypeMap['types::iaabb'],
        /**
         * accumulates amount of gold picked during consecutive frames
         * - Hints: 0 [0, 1]
         */
        mGoldAccumulator: number,
        /**
         * last frame we picked gold
         * - Hints: -2 [0, 1]
         */
        mLastFramePickedGold: number,
    };
    MoveToSurfaceOnCreateComponent: {
        /**
         * - Hints: 64 [0, 64]
         */
        lookup_radius: number,
        /**
         * - Hints: 2 [0, 10]
         */
        offset_from_surface: number,
        /**
         * - Hints: 4 [0, 8]
         */
        ray_count: number,
        /**
         * - Hints: 32 [0, 128]
         */
        verlet_min_joint_distance: number,
        /**
         */
        type: ComponentTypeMap['MOVETOSURFACE_TYPE::Enum'],
    };
    MusicEnergyAffectorComponent: {
        /**
         * the energy this makes music go towards
         * - Hints: 0.5 [0, 1]
         */
        energy_target: number,
        /**
         * if > 0, fade between 0 and energy_target based on distance to this entity
         * - Hints: 0 [0, 256]
         */
        fade_range: number,
        /**
         * if 1, attempts to trigger danger music no matter what energy level is reached
         * - Hints: 1 [0, 1]
         */
        trigger_danger_music: boolean,
        /**
         * if fog of war at position of this entity is greater than 'fog_of_war_threshold', this has  no effect
         * - Hints: 200 [0, 255]
         */
        fog_of_war_threshold: number,
        /**
         * - Hints: 1 [0, 1]
         */
        is_enemy: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        energy_lerp_up_speed_multiplier: number,
    };
    NinjaRopeComponent: {
        /**
         * - Hints: 356 [0, 2000]
         */
        max_length: number,
        /**
         * - Hints: 0 [0, 2000]
         */
        mLength: number,
        /**
         */
        mSegments: ComponentTypeMap['NINJA_ROPE_SEGMENT_VECTOR'],
    };
    NullDamageComponent: {
        /**
         * if less than 1, then will roll the die to see if it will NULL all damage. Stick this into your projectile entity
         * - Hints: 1 [0, 1]
         */
        null_chance: number,
    };
    OrbComponent: {
        /**
         * must be unique for every orb in the world
         * - Hints: 0 [0, 20]
         */
        orb_id: number,
    };
    ParticleEmitterComponent: {
        /**
         * - Hints: blood [0, 1]
         */
        emitted_material_name: string,
        /**
         * used to be emit_real_particles - creates these particles in the grid, if that happens velocity and lifetime are ignored
         * - Hints: 0 [0, 1]
         */
        create_real_particles: boolean,
        /**
         * this creates particles that will behave like particles, but work outside of the screen
         * - Hints: 0 [0, 1]
         */
        emit_real_particles: boolean,
        /**
         * particle does have collisions, but no other physical interactions with the world. the particles are culled outside camera region
         * - Hints: 0 [0, 1]
         */
        emit_cosmetic_particles: boolean,
        /**
         * cosmetic particles are created inside grid cells
         * - Hints: 1 [0, 1]
         */
        cosmetic_force_create: boolean,
        /**
         * for cosmetic particles, if they are rendered on front or in the back...
         * - Hints: 1 [0, 1]
         */
        render_back: boolean,
        /**
         * if 1, particles made of a glowing material will be 3x as bright as usually
         * - Hints: 0 [0, 1]
         */
        render_ultrabright: boolean,
        /**
         * for cosmetic particles, if 1 the particles collide with grid and only exist in screen space
         * - Hints: 1 [0, 1]
         */
        collide_with_grid: boolean,
        /**
         * does it collide with gas and fire, works with create_real_particles and raytraced images 
         * - Hints: 1 [0, 1]
         */
        collide_with_gas_and_fire: boolean,
        /**
         * for cosmetic particles, forces them (gas,fire) to be only 1 pixel wide 
         * - Hints: 1 [0, 1]
         */
        particle_single_width: boolean,
        /**
         * This is turned for potions after they take some damage and start leaking
         * - Hints: 0 [0, 1]
         */
        emit_only_if_there_is_space: boolean,
        /**
         * emitter lifetime in frames. -1 = infinite
         * - Hints: -1 [0, 1]
         */
        emitter_lifetime_frames: number,
        /**
         * if set, and fire cells are created, this changes their default behaviour of igniting DamageModels
         * - Hints: 0 [0, 1]
         */
        fire_cells_dont_ignite_damagemodel: boolean,
        /**
         * if true, will get the particle color based on the world position (instead of randomizing it)
         * - Hints: 0 [0, 1]
         */
        color_is_based_on_pos: boolean,
        /**
         * if >= 0, will use this as particle alpha
         * - Hints: -1 [0, 1]
         */
        custom_alpha: number,
        /**
         * - Hints: 0 [-20, 20]
         */
        x_pos_offset_min: number,
        /**
         * - Hints: 0 [-20, 20]
         */
        y_pos_offset_min: number,
        /**
         * - Hints: 0 [-20, 20]
         */
        x_pos_offset_max: number,
        /**
         * - Hints: 0 [-20, 20]
         */
        y_pos_offset_max: number,
        /**
         * - Hints: 360 [0, 360]
         */
        area_circle_sector_degrees: number,
        /**
         * - Hints: 0 [-100, 100]
         */
        x_vel_min: number,
        /**
         * - Hints: 0 [-100, 100]
         */
        x_vel_max: number,
        /**
         * - Hints: 0 [-100, 100]
         */
        y_vel_min: number,
        /**
         * - Hints: 0 [-100, 100]
         */
        y_vel_max: number,
        /**
         * - Hints: 0 [0, 90]
         */
        direction_random_deg: number,
        /**
         * if set, will make the velocity's rotation always away from center of randomized aabb
         * - Hints: 0 [-256, 256]
         */
        velocity_always_away_from_center: number,
        /**
         * - Hints: 5 [0, 10]
         */
        lifetime_min: number,
        /**
         * - Hints: 10 [0, 10]
         */
        lifetime_max: number,
        /**
         * - Hints: 0 [0, 6]
         */
        airflow_force: number,
        /**
         * - Hints: 1 [0, 2]
         */
        airflow_time: number,
        /**
         * - Hints: 1 [0, 2]
         */
        airflow_scale: number,
        /**
         * - Hints: 0 [0, 10]
         */
        friction: number,
        /**
         * If > 0, an attractor is created at the position of the entity that owns this component
         * - Hints: 0 [0, 100]
         */
        attractor_force: number,
        /**
         * - Hints: 5 [0, 120]
         */
        emission_interval_min_frames: number,
        /**
         * - Hints: 10 [0, 120]
         */
        emission_interval_max_frames: number,
        /**
         * - Hints: 100 [0, 100]
         */
        emission_chance: number,
        /**
         * if set will delay this many frames until starts
         * - Hints: 0 [0, 1]
         */
        delay_frames: number,
        /**
         * - Hints: 1 [0, 1]
         */
        is_emitting: boolean,
        /**
         * if set, it'll use MaterialInventoryComponent as the source of the particles emitted
         * - Hints: 0 [0, 1]
         */
        use_material_inventory: boolean,
        /**
         * if set, will do a trail based on the previous position and current position
         * - Hints: 0 [0, 1]
         */
        is_trail: boolean,
        /**
         * if > 0, trail particles will be generated this far from each other between our old and new position, else [count_min-count_max] particles will be generated on the line
         * - Hints: 0 [0, 1]
         */
        trail_gap: number,
        /**
         * if set, particle render positions will be snapped to cell grid
         * - Hints: 0 [0, 1]
         */
        render_on_grid: boolean,
        /**
         * if set, particle's position in its lifetime will determine the rendering alpha
         * - Hints: 0 [0, 1]
         */
        fade_based_on_lifetime: boolean,
        /**
         * if set, particle will rendered as a trail along it's movement vector
         * - Hints: 0 [0, 1]
         */
        draw_as_long: boolean,
        /**
         * if 0 nothing happens, if 1 will apply a force to the physics body (if has one), also requires that we use the material inventory
         * - Hints: 0 [0, 10]
         */
        b2_force: number,
        /**
         * if set will set the magic creation 1 in the cells and do the white glow effect
         * - Hints: 0 [0, 1]
         */
        set_magic_creation: boolean,
        /**
         * file to use for image-based animation
         */
        image_animation_file: string,
        /**
         * file to use for image-based animation
         */
        image_animation_colors_file: string,
        /**
         * how long do we stay on one frame of image-based animation. 0.5 means two game frames per one animation frame. 2.0 means two animation frames per one game frame, and so on. 0 means we always emit at time 0 of the animation.
         * - Hints: 1 [0, 255]
         */
        image_animation_speed: number,
        /**
         * does image-based animation keep looping while this component is active?
         * - Hints: 1 [0, 1]
         */
        image_animation_loop: boolean,
        /**
         * the point in time [0,1] where the image-based animation will start the first cycle
         * - Hints: 0 [0, 1]
         */
        image_animation_phase: number,
        /**
         * [0,1], probability of emitting image based particles is multiplied with this
         * - Hints: 1 [0, 1]
         */
        image_animation_emission_probability: number,
        /**
         * enable this to disable image_animations (from the center) going through the world
         * - Hints: 0 [0, 1]
         */
        image_animation_raytrace_from_center: boolean,
        /**
         * if 1, image animation emission will be rotated based on entity rotation
         * - Hints: 0 [0, 1]
         */
        image_animation_use_entity_rotation: boolean,
        /**
         * if 1, mExPosition and m_last_emit_position will not be updated when receiving Message_TransformUpdated
         * - Hints: 0 [0, 1]
         */
        ignore_transform_updated_msg: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        color: ComponentTypeMap['uint32'],
        /**
         */
        offset: ComponentTypeMap['vec2'],
        /**
         * If > 0, the particles will be emitted inside a circular area defined by the min and max bounds of 'area_circle_radius'.
         */
        area_circle_radius: ComponentTypeMap['ValueRange'],
        /**
         */
        gravity: ComponentTypeMap['vec2'],
        /**
         */
        count_min: ComponentTypeMap['LensValue<int>'],
        /**
         */
        count_max: ComponentTypeMap['LensValue<int>'],
        /**
         * NONE or FIRE
         */
        custom_style: ComponentTypeMap['PARTICLE_EMITTER_CUSTOM_STYLE::Enum'],
        /**
         * is used with is_trail
         */
        mExPosition: ComponentTypeMap['vec2'],
        /**
         * this is how we figure out the pressure, when using material_inventory
         * - Hints: 1024 [0, 1]
         */
        mMaterialInventoryMax: number,
        /**
         */
        m_material_id: ComponentTypeMap['LensValue<int>'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_next_emit_frame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        m_has_emitted: boolean,
        /**
         */
        m_last_emit_position: ComponentTypeMap['ivec2'],
        /**
         */
        m_cached_image_animation: ComponentTypeMap['ParticleEmitter_Animation*'],
        /**
         * - Hints: 0 [0, 1]
         */
        m_image_based_animation_time: number,
        /**
         */
        m_collision_angles: ComponentTypeMap['float*'],
        /**
         * - Hints: -1 [0, 1]
         */
        m_particle_attractor_id: ComponentTypeMap['int16'],
    };
    PathFindingComponent: {
        /**
         * TODO: Comment
         * - Hints: 20 [0, 1e+006]
         */
        search_depth_max_no_goal: number,
        /**
         * TODO: Comment
         * - Hints: 1500 [0, 1e+006]
         */
        iterations_max_no_goal: number,
        /**
         * TODO: Comment
         * - Hints: 2500 [0, 1e+006]
         */
        search_depth_max_with_goal: number,
        /**
         * TODO: Comment
         * - Hints: 1500 [0, 1e+006]
         */
        iterations_max_with_goal: number,
        /**
         * TODO: Comment
         * - Hints: 20 [0, 100000]
         */
        cost_of_flying: number,
        /**
         * TODO: Comment
         * - Hints: 2 [0, 200]
         */
        distance_to_reach_node_x: number,
        /**
         * TODO: Comment
         * - Hints: 6 [0, 200]
         */
        distance_to_reach_node_y: number,
        /**
         * TODO: Comment
         * - Hints: 60 [0, 600]
         */
        frames_to_get_stuck: number,
        /**
         * TODO: Comment
         * - Hints: 30 [0, 300]
         */
        frames_between_searches: number,
        /**
         * TODO: Comment
         * - Hints: 0 [-100, 100]
         */
        y_walking_compensation: number,
        /**
         * TODO: Comment
         * - Hints: 1 [0, 1]
         */
        can_fly: boolean,
        /**
         * TODO: Comment
         * - Hints: 1 [0, 1]
         */
        can_walk: boolean,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        can_jump: boolean,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        can_dive: boolean,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        can_swim_on_surface: boolean,
        /**
         * if 1, we require a path to have an entity at the goal, having line of sight to the entity is not enough
         * - Hints: 0 [0, 1]
         */
        never_consider_line_of_sight: boolean,
        /**
         * how far (in cells) must a point on our route be from the nearest wall to consider it passable?
         * - Hints: 0 [0, 20]
         */
        space_required: number,
        /**
         * TODO: Comment
         * - Hints: 400 [0, 400]
         */
        max_jump_distance_from_camera: number,
        /**
         * TODO: Comment
         * - Hints: 200 [0, 1000]
         */
        jump_speed: number,
        /**
         * TODO: Comment
         * - Hints: 1 [0, 5]
         */
        initial_jump_lob: number,
        /**
         * TODO: Comment
         * - Hints: 100 [0, 1000]
         */
        initial_jump_max_distance_x: number,
        /**
         * TODO: Comment
         * - Hints: 80 [0, 1000]
         */
        initial_jump_max_distance_y: number,
        /**
         * Read only value to get mState as an integer. Used to detect when the worst cheesers are trying to cheese our beloved squidward.
         * - Hints: 0 [0, 1]
         */
        read_state: number,
        /**
         * TODO: Comment
         */
        jump_trajectories: ComponentTypeMap['VECTOR_JUMPPARAMS'],
        /**
         * TODO: Comment
         */
        input: ComponentTypeMap['PathFindingInput'],
        /**
         * TODO: Comment
         */
        job_result_receiver: ComponentTypeMap['MSG_QUEUE_PATH_FINDING_RESULT'],
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        waiting_for: boolean,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        next_search_frame: number,
        /**
         * TODO: Comment
         */
        path: ComponentTypeMap['VECTOR_PATHNODE'],
        /**
         * TODO: Comment
         */
        path_next_node: ComponentTypeMap['PathFindingResultNode'],
        /**
         * TODO: Comment
         */
        path_next_node_vector_to: ComponentTypeMap['vec2'],
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        path_next_node_distance_to: number,
        /**
         * TODO: Comment
         */
        path_previous_node: ComponentTypeMap['PathFindingNodeHandle'],
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        path_frames_stuck: number,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        path_is_stuck: boolean,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        path_last_frame_with_job: number,
        /**
         * this defines what is an acceptable path
         */
        mLogic: ComponentTypeMap['PathFindingLogic*'],
        /**
         * we use this to define an acceptable path if mLogic doesn't return one
         */
        mFallbackLogic: ComponentTypeMap['PathFindingLogic*'],
        /**
         * TODO: Comment
         */
        mSelectedLogic: ComponentTypeMap['PathFindingLogic*'],
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        mEnabled: boolean,
        /**
         * TODO: Comment
         */
        mState: ComponentTypeMap['PathFindingComponentState::Enum'],
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        mTimesStuck: number,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        mNextClearDontApproachListFrame: number,
        /**
         * TODO: Comment
         * - Hints: 0 [0, 1]
         */
        mNodeProximityCheckCorrectionY: number,
        /**
         * TODO: Comment
         */
        debug_path: ComponentTypeMap['VECTOR_PATHNODE'],
        /**
         * TODO: Comment
         */
        jump_velocity_multiplier: ComponentTypeMap['LensValue<float>'],
    };
    PathFindingGridMarkerComponent: {
        /**
         * - Hints: 0 [0, 255]
         */
        marker_work_flag: number,
        /**
         * - Hints: 0 [-1000, 1000]
         */
        marker_offset_x: number,
        /**
         * - Hints: 0 [-1000, 1000]
         */
        marker_offset_y: number,
        /**
         * - Hints: 0 [0, 128]
         */
        player_marker_radius: number,
        /**
         * we change the work state of this node. thus we need to keep a reference to it
         */
        mNode: ComponentTypeMap['PathFindingNodeHandle'],
    };
    PhysicsAIComponent: {
        /**
         * - Hints: 5 [0, 1]
         */
        target_vec_max_len: number,
        /**
         * - Hints: 30 [0, 1]
         */
        force_coeff: number,
        /**
         * - Hints: 1.5 [0, 1]
         */
        force_balancing_coeff: number,
        /**
         * - Hints: 100 [0, 1]
         */
        force_max: number,
        /**
         * - Hints: 50 [0, 1]
         */
        torque_coeff: number,
        /**
         * - Hints: 0.2 [0, 1]
         */
        torque_balancing_coeff: number,
        /**
         * - Hints: 50 [0, 1]
         */
        torque_max: number,
        /**
         * - Hints: 100 [0, 1]
         */
        torque_damaged_max: number,
        /**
         * - Hints: 0 [0, 1]
         */
        torque_jump_random: number,
        /**
         * - Hints: 80 [0, 1]
         */
        damage_deactivation_probability: number,
        /**
         * - Hints: 30 [0, 1]
         */
        damage_deactivation_time_min: number,
        /**
         * - Hints: 60 [0, 1]
         */
        damage_deactivation_time_max: number,
        /**
         * - Hints: 0.3 [0, 1]
         */
        die_on_remaining_mass_percentage: number,
        /**
         * - Hints: 1 [0, 1]
         */
        levitate: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        v0_jump_logic: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        v0_swim_logic: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        v0_body_id_logic: boolean,
        /**
         * - Hints: -2 [0, 1]
         */
        swim_check_y_min: number,
        /**
         * - Hints: 2 [0, 1]
         */
        swim_check_y_max: number,
        /**
         * - Hints: 4 [0, 1]
         */
        swim_check_side_x: number,
        /**
         * - Hints: -2 [0, 1]
         */
        swim_check_side_y: number,
        /**
         * fix to the bug in which the spiders spawned inside the holy mountain, if set will try not to go into places which aren't loaded 
         * - Hints: 1 [0, 1]
         */
        keep_inside_world: boolean,
        /**
         * set true for the boss, because box2d might turn this body into a static body, if it thinks it's glitching out. 
         * - Hints: 0 [0, 1]
         */
        free_if_static: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        rotation_speed: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mStartingMass: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mMainBodyFound: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrameActive: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mRotationTarget: number,
        /**
         */
        mLastPositionWhenHadPath: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mHasLastPosition: boolean,
    };
    PhysicsBody2Component: {
        /**
         * this is mBody->GetBodyId() - not to be confused with uid, has to be tracked separately, since the mBody pointer is not unique
         * - Hints: 0 [0, 1]
         */
        mBodyId: ComponentTypeMap['b2ObjectID'],
        /**
         * - Hints: 0 [0, 1]
         */
        linear_damping: number,
        /**
         * - Hints: 0 [0, 1]
         */
        angular_damping: number,
        /**
         * - Hints: 1 [0, 1]
         */
        allow_sleep: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        fixed_rotation: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_bullet: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_static: boolean,
        /**
         * - Hints: 0.7 [0, 1]
         */
        buoyancy: number,
        /**
         * if 1, will lift the body upwards if it is inside ground
         * - Hints: 0 [0, 1]
         */
        hax_fix_going_through_ground: boolean,
        /**
         * hax_fix_going_through_ground has to be set, if set will lift the body upwards if it is inside sand
         * - Hints: 0 [0, 1]
         */
        hax_fix_going_through_sand: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        hax_wait_till_pixel_scenes_loaded: boolean,
        /**
         * if 1, will go through sand PhysicsBridge::mGoThroughSand = 1
         * - Hints: 0 [0, 1]
         */
        go_through_sand: boolean,
        /**
         * if 1, the simulation might destroy this body if it's hidden under sand. Problematic if you have a small piece with joint attached to something like the wheels of minecart. Set to 0 in cases like that
         * - Hints: 1 [0, 1]
         */
        auto_clean: boolean,
        /**
         * if 1, we will mark our predicted aabb as a box2d update area.
         * - Hints: 1 [0, 1]
         */
        force_add_update_areas: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        update_entity_transform: boolean,
        /**
         * if 1, will kill the entity when physics body is destroyed
         * - Hints: 1 [0, 1]
         */
        kill_entity_if_body_destroyed: boolean,
        /**
         * if 1, will destroy the entity after initialization has been done based the entity's PhysicsBodyComponents and JointComponents
         * - Hints: 0 [0, 1]
         */
        kill_entity_after_initialized: boolean,
        /**
         * if 1, initialization occurs only when done via for example lua component and Physic2InitFromComponents()
         * - Hints: 0 [0, 1]
         */
        manual_init: boolean,
        /**
         * if 1, root body is destroyed if the entity is destroyed
         * - Hints: 0 [0, 1]
         */
        destroy_body_if_entity_destroyed: boolean,
        /**
         * TODO
         * - Hints: 0 [0, 1]
         */
        root_offset_x: number,
        /**
         * TODO
         * - Hints: 0 [0, 1]
         */
        root_offset_y: number,
        /**
         * TODO
         * - Hints: 0 [0, 1]
         */
        init_offset_x: number,
        /**
         * TODO
         * - Hints: 0 [0, 1]
         */
        init_offset_y: number,
        /**
         * private variable, please don't mess around with this
         * - Hints: 0 [0, 1]
         */
        mActiveState: boolean,
        /**
         * the number of pixels the body had when it was originally created
         * - Hints: 0 [0, 1]
         */
        mPixelCountOrig: ComponentTypeMap['uint32'],
        /**
         * private variable, please don't mess around with this
         */
        mLocalPosition: ComponentTypeMap['vec2'],
        /**
         */
        mBody: ComponentTypeMap['b2Body*'],
        /**
         * private variable, please don't mess around with this
         * - Hints: 0 [0, 1]
         */
        mInitialized: boolean,
        /**
         * if set, tracks the number of csolidcells the body has
         * - Hints: 0 [0, 1]
         */
        mPixelCount: ComponentTypeMap['uint32'],
        /**
         * this is sure the bodies are only parsed once
         * - Hints: 0 [0, 1]
         */
        mRefreshed: boolean,
    };
    PhysicsBodyCollisionDamageComponent: {
        /**
         * - Hints: 60 [0, 100]
         */
        speed_threshold: number,
        /**
         * - Hints: 0.016667 [0, 1]
         */
        damage_multiplier: number,
    };
    PhysicsBodyComponent: {
        /**
         * if mBody is set from outside, will ignore all the things
         * - Hints: 0 [0, 1]
         */
        is_external: boolean,
        /**
         * if set will lift the body upwards if it is inside ground
         * - Hints: 0 [0, 1]
         */
        hax_fix_going_through_ground: boolean,
        /**
         * hax_fix_going_through_ground has to be set, if set will lift the body upwards if it is inside sand
         * - Hints: 0 [0, 1]
         */
        hax_fix_going_through_sand: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        hax_wait_till_pixel_scenes_loaded: boolean,
        /**
         * if the entity has multiple physics bodies and has specific shapes for those and possible joints, you should use this. 0 is default for shapes
         * - Hints: 0 [0, 1000]
         */
        uid: number,
        /**
         * Use this to kill the physics body of. if is_enabled is set to false, will destroy the physics body
         * - Hints: 1 [0, 1]
         */
        is_enabled: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        linear_damping: number,
        /**
         * - Hints: 0 [0, 1]
         */
        angular_damping: number,
        /**
         * - Hints: 1 [0, 1]
         */
        allow_sleep: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        fixed_rotation: boolean,
        /**
         * - Hints: 0.7 [0, 1]
         */
        buoyancy: number,
        /**
         * - Hints: 1 [0, 1]
         */
        gravity_scale_if_has_no_image_shapes: number,
        /**
         * - Hints: 0 [0, 1]
         */
        is_bullet: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_static: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_kinematic: boolean,
        /**
         * if it is a character, then we need to few interesting things from time to time
         * - Hints: 0 [0, 1]
         */
        is_character: boolean,
        /**
         * if set, will go through sand PhysicsBridge::mGoThroughSand = 1
         * - Hints: 0 [0, 1]
         */
        go_through_sand: boolean,
        /**
         * default is 1. You should only change this if you know the body isn't going to touch gridworld
         * - Hints: 1 [0, 1]
         */
        gridworld_box2d: boolean,
        /**
         * if set, the simulation might destroy this body if it's hidden under sand. Problematic if you have a small piece with joint attached to something like the wheels of minecart. Set to 0 in cases like that
         * - Hints: 1 [0, 1]
         */
        auto_clean: boolean,
        /**
         * if set, will leave the b2body into the world, even if the entity is killed
         * - Hints: 0 [0, 1]
         */
        on_death_leave_physics_body: boolean,
        /**
         * camera bound... god damn... we need something special when we want to leave the body
         * - Hints: 0 [0, 1]
         */
        on_death_really_leave_body: boolean,
        /**
         * WARNING! Don't touch this unless you know what you're doing. If false, doesn't update the entitys transform to match the physics body. This is used with multi body entities, to use the correct body to update the entity, e.g. minecart
         * - Hints: 1 [0, 1]
         */
        update_entity_transform: boolean,
        /**
         * if 1, we will mark our predicted aabb as a box2d update area.
         * - Hints: 0 [0, 1]
         */
        force_add_update_areas: boolean,
        /**
         * if set, will kill the entity when physics body is destroyed
         * - Hints: 1 [0, 1]
         */
        kills_entity: boolean,
        /**
         * for physics projectiles, if true will initially rotate the body based on the velocity
         * - Hints: 0 [0, 1]
         */
        projectiles_rotate_toward_velocity: boolean,
        /**
         * randomizes the init velocity
         * - Hints: 0 [0, 1]
         */
        randomize_init_velocity: boolean,
        /**
         * private variable, please don't mess around with this
         * - Hints: 0 [0, 1]
         */
        mActiveState: boolean,
        /**
         * if you want a velocity at the start, set it here
         */
        initial_velocity: ComponentTypeMap['vec2'],
        /**
         */
        mBody: ComponentTypeMap['b2Body*'],
        /**
         * this is mBody->GetBodyId() - not to be confused with uid shit, has to be tracked separately, since the mBody pointer is not unique
         * - Hints: 0 [0, 1]
         */
        mBodyId: ComponentTypeMap['b2ObjectID'],
        /**
         * if set, tracks the number of csolidcells the body has
         * - Hints: 0 [0, 1]
         */
        mPixelCount: number,
        /**
         */
        mLocalPosition: ComponentTypeMap['b2Vec2'],
        /**
         * this is sure the bodies are only parsed once
         * - Hints: 0 [0, 1]
         */
        mRefreshed: boolean,
    };
    PhysicsImageShapeComponent: {
        /**
         * if 1, PhysicsBody2Component will use this to figure out where the entity is located
         * - Hints: 0 [0, 1]
         */
        is_root: boolean,
        /**
         * used to figure out which bodies are attached to each other when creating joints
         * - Hints: 0 [0, 1000]
         */
        body_id: number,
        /**
         * will try to find the SpriteComponent and use that
         * - Hints: 0 [0, 1]
         */
        use_sprite: boolean,
        /**
         * tries to fit this into a circle, looks at bounding box of the pixels and sets the circle to the center of that with radius being the line from there to a straight edge
         * - Hints: 0 [0, 1]
         */
        is_circle: boolean,
        /**
         * if this is true, moves offset to be in the center of the image, overwrites the offset_x, offset_y
         * - Hints: 0 [0, 1]
         */
        centered: boolean,
        /**
         * offset x in pixels
         * - Hints: 0 [0, 1]
         */
        offset_x: number,
        /**
         * offset y in pixels
         * - Hints: 0 [0, 1]
         */
        offset_y: number,
        /**
         * offset in the z direction
         * - Hints: 0 [0, 1]
         */
        z: number,
        /**
         * the png file from which the body is created from
         */
        image_file: string,
        /**
         * the material from which the body is created
         * - Hints: 0 [0, 1]
         */
        material: number,
        /**
         * used in joint creation phase
         */
        mBody: ComponentTypeMap['b2Body*'],
    };
    PhysicsJoint2Component: {
        /**
         * Use this to create a relation between PhysicsJointMutator and a joint. The PhysicsJointMutator must exist when the physics objects are initialized for the first time. This id should be unique inside one entity. Defaults to 0
         * - Hints: 0 [0, 1000]
         */
        joint_id: ComponentTypeMap['uint16'],
        /**
         * if > 0, will break if theres a force too strong.
         * - Hints: 1.3 [0, 1]
         */
        break_force: number,
        /**
         * if > 0, will break if the anchors on the bodies get further than this.
         * - Hints: 1.4142 [0, 1]
         */
        break_distance: number,
        /**
         * if > 1, will break if an attached body is modified
         * - Hints: 0 [0, 1]
         */
        break_on_body_modified: boolean,
        /**
         * if > 0, will break if the angle between the linked bodies becomes greater than this
         * - Hints: 0 [0, 1]
         */
        break_on_shear_angle_deg: number,
        /**
         * - Hints: 0 [0, 1]
         */
        body1_id: number,
        /**
         * - Hints: 0 [0, 1]
         */
        body2_id: number,
        /**
         * - Hints: 0 [0, 1]
         */
        offset_x: number,
        /**
         * - Hints: 0 [0, 1]
         */
        offset_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        ray_x: number,
        /**
         * - Hints: -10 [0, 1]
         */
        ray_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        surface_attachment_offset_x: number,
        /**
         * - Hints: 2.5 [0, 1]
         */
        surface_attachment_offset_y: number,
        /**
         * Enum - REVOLUTE_JOINT, WELD_JOINT, REVOLUTE_JOINT_ATTACH_TO_NEARBY_SURFACE or WELD_JOINT_ATTACH_TO_NEARBY_SURFACE
         */
        type: ComponentTypeMap['JOINT_TYPE::Enum'],
    };
    PhysicsJoint2MutatorComponent: {
        /**
         * Use this to create a relation between PhysicsJointMutator and a joint created by PhysicsJoint2Component. The PhysicsJoint2Mutator must exist when the physics objects are initialized for the first time.
         * - Hints: 0 [0, 1000]
         */
        joint_id: ComponentTypeMap['uint16'],
        /**
         * if 1, the joint will break and this component will be destroyed.
         * - Hints: 0 [0, 1]
         */
        destroy: boolean,
        /**
         * if != 0 and this is linked to a revolute joint, the joint motor will be enabled at this speed
         * - Hints: 0 [0, 1]
         */
        motor_speed: number,
        /**
         * max torque for motor
         * - Hints: 1 [0, 1]
         */
        motor_max_torque: number,
        /**
         * Private, don't touch this! Stores the joint's id in the physics engine.
         * - Hints: 0 [0, 1]
         */
        mBox2DJointId: ComponentTypeMap['uint64'],
        /**
         * - Hints: 0 [0, 1]
         */
        mPreviousMotorSpeed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mPreviousMotorMaxTorque: number,
    };
    PhysicsJointComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        nail_to_wall: boolean,
        /**
         * if 1, will do a grid joint that works correctly with a body when it is destroyed / chipped away
         * - Hints: 0 [0, 1]
         */
        grid_joint: boolean,
        /**
         * if 1, will break if theres a force too strong
         * - Hints: 0 [0, 1]
         */
        breakable: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        body1_id: number,
        /**
         * - Hints: 0 [0, 1]
         */
        body2_id: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        pos_x: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        pos_y: number,
        /**
         * For mouse joint only ... moves the mouse joint by *dt 
         * - Hints: 0 [-10, 10]
         */
        delta_x: number,
        /**
         * For mouse joint only ... moves the mouse joint by *dt 
         * - Hints: 0 [-10, 10]
         */
        delta_y: number,
        /**
         * enable motor, by setting this to true
         * - Hints: 0 [0, 1]
         */
        mMotorEnabled: boolean,
        /**
         * if enabled this gets set to speed
         * - Hints: 0 [0, 20]
         */
        mMotorSpeed: number,
        /**
         * max torque for motor
         * - Hints: 1 [0, 1]
         */
        mMaxMotorTorque: number,
        /**
         * Enum - JOINT_TYPE
         */
        type: ComponentTypeMap['JOINT_TYPE::Enum'],
        /**
         */
        mJoint: ComponentTypeMap['b2Joint*'],
    };
    PhysicsKeepInWorldComponent: {
        /**
         * All that is needed is to include one of the components with PhysicsBodyComponent or PhysicsBody2Component and it will be frozen when it hits outer edges of the world. NOTE! This will override the auto_clean variable, auto_clean will be set to false. If this is true, will check all the 4 corners of the bounding box
         * - Hints: 0 [0, 1]
         */
        check_whole_aabb: boolean,
        /**
         * Will add the velocity * 1.5 to the aabb to predict where the body will end up at. This will greatly help keep the body inside simulated world.
         * - Hints: 0 [0, 1]
         */
        predict_aabb: boolean,
        /**
         * Will try to keep the object at the latest valid position
         * - Hints: 0 [0, 1]
         */
        keep_at_last_valid_pos: boolean,
        /**
         */
        mExPosition: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mExRotation: number,
    };
    PhysicsPickUpComponent: {
        /**
         * - Hints: 200 [0, 1]
         */
        pick_up_strength: number,
        /**
         */
        transform: ComponentTypeMap['types::xform'],
        /**
         */
        original_left_joint_pos: ComponentTypeMap['vec2'],
        /**
         */
        original_right_joint_pos: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        isBroken: boolean,
        /**
         */
        leftJointPos: ComponentTypeMap['vec2'],
        /**
         */
        rightJointPos: ComponentTypeMap['vec2'],
        /**
         */
        leftJoint: ComponentTypeMap['b2WeldJoint*'],
        /**
         */
        rightJoint: ComponentTypeMap['b2WeldJoint*'],
    };
    PhysicsRagdollComponent: {
        /**
         * file that should include just a list of other files, that have all the parts
         */
        filename: string,
        /**
         * a list of body parts as png images, separate the files by ','. e.g. 'data/temp/ragdoll/leg.png, data/temp/ragdoll/head.png,...'
         */
        filenames: string,
        /**
         * offset of where the ragdoll will be created
         * - Hints: 0 [0, 20]
         */
        offset_x: number,
        /**
         * offset of where the ragdoll will be created
         * - Hints: 0 [0, 20]
         */
        offset_y: number,
        /**
         */
        bodies: ComponentTypeMap['std::vector<b2Body*>*'],
    };
    PhysicsShapeComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        recreate: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_circle: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        is_box: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        is_capsule: boolean,
        /**
         * if set, will use sprite component to figure out a box that fits this
         * - Hints: 0 [0, 1]
         */
        is_based_on_sprite: boolean,
        /**
         * - Hints: 0.75 [0, 1]
         */
        friction: number,
        /**
         * - Hints: 0.1 [0, 1]
         */
        restitution: number,
        /**
         * - Hints: 0.75 [0, 5]
         */
        density: number,
        /**
         * - Hints: 0 [-5, 5]
         */
        local_position_x: number,
        /**
         * - Hints: 0 [-5, 5]
         */
        local_position_y: number,
        /**
         * - Hints: 1 [0, 10]
         */
        radius_x: number,
        /**
         * - Hints: 1 [0, 10]
         */
        radius_y: number,
        /**
         * - Hints: 0.25 [0, 1]
         */
        capsule_x_percent: number,
        /**
         * - Hints: 0.3 [0, 1]
         */
        capsule_y_percent: number,
        /**
         * the material to use for collision audio
         * - Hints: 0 [0, 1]
         */
        material: number,
    };
    PhysicsThrowableComponent: {
        /**
         * - Hints: 1 [0, 2]
         */
        throw_force_coeff: number,
        /**
         * - Hints: 180 [0, 256]
         */
        max_throw_speed: number,
        /**
         * - Hints: 0.5 [0, 20]
         */
        min_torque: number,
        /**
         * - Hints: 8 [0, 20]
         */
        max_torque: number,
        /**
         * - Hints: 3 [0, 20]
         */
        tip_check_offset_min: number,
        /**
         * - Hints: 5 [0, 20]
         */
        tip_check_offset_max: number,
        /**
         * - Hints: 9 [0, 180]
         */
        tip_check_random_rotation_deg: number,
        /**
         * - Hints: 70 [0, 180]
         */
        attach_min_speed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        attach_to_surfaces_knife_style: boolean,
        /**
         * WIP WIP
         * - Hints: 100 [0, 200]
         */
        hp: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mHasJoint: boolean,
    };
    PixelSceneComponent: {
        /**
         * loads this pixel scene file
         */
        pixel_scene: string,
        /**
         * this is the colors that get used for the pixels, if empty will use material colors
         */
        pixel_scene_visual: string,
        /**
         * this is the background file that gets loaded, if empty won't do anything
         */
        pixel_scene_background: string,
        /**
         * the standard z_index of pixel scene backgrounds
         * - Hints: 50 [0, 1]
         */
        background_z_index: number,
        /**
         * how much off from the entity x,y will this be. Top left corner is where it loads the pixel scene
         * - Hints: 0 [-30, 30]
         */
        offset_x: number,
        /**
         * - Hints: 0 [-30, 30]
         */
        offset_y: number,
        /**
         * biome check is on by default - it will check that pixel scene is loaded so that every corner is in the same biome
         * - Hints: 0 [0, 1]
         */
        skip_biome_checks: boolean,
        /**
         * if on - won't do the edge textures for the pixel scene
         * - Hints: 0 [0, 1]
         */
        skip_edge_textures: boolean,
    };
    PixelSpriteComponent: {
        /**
         * loads pixelsprite based on this file
         */
        image_file: string,
        /**
         * the anchor and center_offset
         * - Hints: 0 [0, 3.5]
         */
        anchor_x: number,
        /**
         * the anchor and center_offset
         * - Hints: 0 [0, 3.5]
         */
        anchor_y: number,
        /**
         * what's the material that things are made out of, TODO - change this into MetaCustom
         * - Hints: wood_loose [0, 1]
         */
        material: string,
        /**
         * if 1, this can be broken with digger
         * - Hints: 1 [0, 1]
         */
        diggable: boolean,
        /**
         * cleans up the pixels that are ovelapping in the world
         * - Hints: 1 [0, 1]
         */
        clean_overlapping_pixels: boolean,
        /**
         * kills the entity, if the pixel sprite is dead (empty)
         * - Hints: 1 [0, 1]
         */
        kill_when_sprite_dies: boolean,
        /**
         * if true, will create new pixel sprites with box2d bodies, instead of gridworld cells
         * - Hints: 0 [0, 1]
         */
        create_box2d_bodies: boolean,
        /**
         */
        mPixelSprite: ComponentTypeMap['PixelSprite*'],
    };
    PlatformShooterPlayerComponent: {
        /**
         * - Hints: 40 [0, 1000]
         */
        aiming_reticle_distance_from_character: number,
        /**
         * - Hints: 25 [0, 1000]
         */
        camera_max_distance_from_character: number,
        /**
         * - Hints: 0.005 [0, 1000]
         */
        alcohol_drunken_speed: number,
        /**
         * - Hints: 0.006 [0, 1000]
         */
        blood_fungi_drunken_speed: number,
        /**
         * - Hints: 0.006 [0, 1000]
         */
        blood_worm_drunken_speed: number,
        /**
         * - Hints: 1 [0, 100]
         */
        eating_cells_per_frame: number,
        /**
         * - Hints: 5 [0, 100]
         */
        eating_probability: number,
        /**
         * - Hints: 30 [0, 100]
         */
        eating_delay_frames: number,
        /**
         * - Hints: 0.1 [0, 1000]
         */
        stoned_speed: number,
        /**
         * - Hints: 1 [0, 1]
         */
        center_camera_on_this_entity: boolean,
        /**
         * if true, moves camera with the aim.
         * - Hints: 1 [0, 1]
         */
        move_camera_with_aim: boolean,
        /**
         */
        eating_area_min: ComponentTypeMap['ivec2'],
        /**
         */
        eating_area_max: ComponentTypeMap['ivec2'],
        /**
         */
        mSmoothedCameraPosition: ComponentTypeMap['vec2'],
        /**
         */
        mSmoothedAimingVector: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mCameraRecoil: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCameraRecoilTarget: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCrouching: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mCameraDistanceLerped: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mRequireTriggerPull: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mWarpDelay: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mItemTemporarilyHidden: number,
        /**
         */
        mDesiredCameraPos: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mHasGamepadControlsPrev: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mForceFireOnNextUpdate: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mFastMovementParticlesAlphaSmoothed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mTeleBoltFramesDuringLastSecond: ComponentTypeMap['uint64'],
        /**
         * - Hints: 0 [0, 1]
         */
        mCamCorrectionTeleSmoothed: number,
        /**
         */
        mCamCorrectionGainSmoothed: ComponentTypeMap['vec2'],
        /**
         */
        mCameraErrorPrev: ComponentTypeMap['Vec2ArrayInline'],
        /**
         */
        mCamErrorAveraged: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mCamMovingFastPrev: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mCamFrameStartedMovingFast: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCamFrameLastMovingFastExplosion: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCessationDo: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mCessationLifetime: number,
    };
    PlayerCollisionComponent: {
        /**
         * - Hints: 5 [0, 100]
         */
        getting_crushed_threshold: number,
        /**
         * - Hints: 3 [0, 100]
         */
        moving_up_before_getting_crushed_threshold: number,
        /**
         * 1.12.2018 - Is this still used?
         * - Hints: 0 [0, 1]
         */
        getting_crushed_counter: number,
        /**
         * used this mostly for player to figure out if it's stuck in ground
         * - Hints: 0 [0, 1]
         */
        stuck_in_ground_counter: number,
        /**
         * used to report error + also to free the player in case something horrible has gone wrong
         * - Hints: 0 [0, 1]
         */
        DEBUG_stuck_in_static_ground: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mCollidedHorizontally: boolean,
        /**
         * hax
         */
        mPhysicsCollisionHax: ComponentTypeMap['b2Body*'],
    };
    PlayerStatsComponent: {
        /**
         * - Hints: 1 [0, 1]
         */
        lives: number,
        /**
         * - Hints: 4 [0, 1]
         */
        max_hp: number,
        /**
         * - Hints: 1 [0, 1]
         */
        speed: number,
    };
    PositionSeedComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        pos_x: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        pos_y: number,
    };
    PotionComponent: {
        /**
         * - Hints: 1 [0, 2]
         */
        spray_velocity_coeff: number,
        /**
         * - Hints: 0.5 [0, 1]
         */
        spray_velocity_normalized_min: number,
        /**
         * - Hints: 0 [0, 1]
         */
        body_colored: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        throw_bunch: boolean,
        /**
         * - Hints: 5 [0, 1]
         */
        throw_how_many: number,
        /**
         * NOTE( Petri ): 15.8.2023 - if this is set to true, will only spray dynamic materials, that dont cause bugs (i.e. will not spray hard rock, box2d materials)
         * - Hints: 0 [0, 1]
         */
        dont_spray_static_materials: boolean,
        /**
         * NOTE( Petri ): 15.8.2023 - if this is set to true, will only leak gas materials instead of 'spraying' them.
         * - Hints: 0 [0, 1]
         */
        dont_spray_just_leak_gas_materials: boolean,
        /**
         * Petri: body_colored didn't seem to work, so I added never_color. It can be set to true if you never want the potion to be colored
         * - Hints: 0 [0, 1]
         */
        never_color: boolean,
        /**
         * if set, will always use the color from this material
         * - Hints: 0 [0, 1]
         */
        custom_color_material: number,
    };
    PressurePlateComponent: {
        /**
         * how often do we check the world
         * - Hints: 30 [0, 1]
         */
        check_every_x_frames: number,
        /**
         * 0 is up, 1 is down
         * - Hints: 0 [0, 1]
         */
        state: number,
        /**
         * how much material should there be in the aabbs that we go down 
         * - Hints: 0.75 [0, 1]
         */
        material_percent: number,
        /**
         */
        aabb_min: ComponentTypeMap['vec2'],
        /**
         */
        aabb_max: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextFrame: number,
    };
    ProjectileComponent: {
        /**
         * lifetime, -1 means it's endless, otherwise it's the frame count
         * - Hints: -1 [0, 1]
         */
        lifetime: number,
        /**
         * final lifetime will be lifetime + random(-lifetime_randomness,lifetime_randomness)
         * - Hints: 0 [0, 1]
         */
        lifetime_randomness: number,
        /**
         * when lifetime runs out, should we explode?
         * - Hints: 0 [0, 1]
         */
        on_lifetime_out_explode: boolean,
        /**
         * true by default. Some projectiles you don't want to collide with the world, e.g. blackholes
         * - Hints: 1 [0, 1]
         */
        collide_with_world: boolean,
        /**
         * - Hints: 60 [0, 60000]
         */
        speed_min: number,
        /**
         * - Hints: 60 [0, 60000]
         */
        speed_max: number,
        /**
         * - Hints: 0 [0, 60000]
         */
        friction: number,
        /**
         * when fired, randomizes the velocity -this, this
         * - Hints: 0 [0, 3.14151]
         */
        direction_random_rad: number,
        /**
         * when fired, multiplies this with projectile_i and adds it to direction
         * - Hints: 0 [-3.14, 3.14]
         */
        direction_nonrandom_rad: number,
        /**
         * - Hints: 0.5 [0, 60000]
         */
        lob_min: number,
        /**
         * - Hints: 0.8 [0, 60000]
         */
        lob_max: number,
        /**
         * - Hints: 0 [0, 60000]
         */
        camera_shake_when_shot: number,
        /**
         * - Hints: 0 [0, 60000]
         */
        shoot_light_flash_radius: number,
        /**
         * - Hints: 255 [0, 255]
         */
        shoot_light_flash_r: ComponentTypeMap['unsigned int'],
        /**
         * - Hints: 180 [0, 255]
         */
        shoot_light_flash_g: ComponentTypeMap['unsigned int'],
        /**
         * - Hints: 150 [0, 255]
         */
        shoot_light_flash_b: ComponentTypeMap['unsigned int'],
        /**
         * should we create shell casings?
         * - Hints: 0 [0, 1]
         */
        create_shell_casing: boolean,
        /**
         * material of the shell casing
         * - Hints: brass [0, 1]
         */
        shell_casing_material: string,
        /**
         * this entity is created along with the projectile, oriented along the projectile's path
         */
        muzzle_flash_file: string,
        /**
         * - Hints: 0 [0, 1e+008]
         */
        bounces_left: number,
        /**
         * when bouncing, velocity is multiplied by this
         * - Hints: 0.5 [0, 1]
         */
        bounce_energy: number,
        /**
         * if true, will do a fake bounce if can't do the proper bounce, but will always try to bounce
         * - Hints: 0 [0, 1]
         */
        bounce_always: boolean,
        /**
         * if true, will bounce at any reflection angle
         * - Hints: 0 [0, 1]
         */
        bounce_at_any_angle: boolean,
        /**
         * if true, will attach to the projectile entity that created this projectile via a trigger
         * - Hints: 0 [0, 1]
         */
        attach_to_parent_trigger: boolean,
        /**
         * this entity is created at the bounce position. it gets the bounce angle as rotation.
         */
        bounce_fx_file: string,
        /**
         * this is only applied if velocity_sets_rotation == false
         * - Hints: 0 [-3.1415, 3.1415]
         */
        angular_velocity: number,
        /**
         * whether we set the rotation based on velocity, as in spear or if we update the rotation with angular_velocity
         * - Hints: 1 [0, 1]
         */
        velocity_sets_rotation: boolean,
        /**
         * if true, the sprite width is made equal to the distance traveled since last frame
         * - Hints: 0 [0, 1]
         */
        velocity_sets_scale: boolean,
        /**
         * Larger value means velocity affects the scale more
         * - Hints: 1 [0, 1]
         */
        velocity_sets_scale_coeff: number,
        /**
         * if true, the sprite is flipped based on which side the projectile is currently traveling
         * - Hints: 0 [0, 1]
         */
        velocity_sets_y_flip: boolean,
        /**
         * updates the animation based on far the sprite moved
         * - Hints: 0 [0, 1]
         */
        velocity_updates_animation: number,
        /**
         * if > 0, this, along with VelocityComponent.mass affects how far we penetrate in materials
         * - Hints: 0 [0, 5]
         */
        ground_penetration_coeff: number,
        /**
         * if 0, will not penetrate into materials with durability greater than this
         * - Hints: 0 [0, 1]
         */
        ground_penetration_max_durability_to_destroy: number,
        /**
         * if set, we never collide with this material
         */
        go_through_this_material: string,
        /**
         * this should probably be true, to get normal projectile behaviour, but you might want to disable this for some physics-based projectiles, like bombs
         * - Hints: 1 [0, 1]
         */
        do_moveto_update: boolean,
        /**
         * if greater than 0, the projectile creates two clones of itself on death. 'on_death_duplicate_remaining' on the clones is reduced by one
         * - Hints: 0 [0, 1]
         */
        on_death_duplicate_remaining: number,
        /**
         * if true, finds all the sprites and leaves as sand cells into the grid
         * - Hints: 1 [0, 1]
         */
        on_death_gfx_leave_sprite: boolean,
        /**
         * if true, does explosion with config_explosion
         * - Hints: 0 [0, 1]
         */
        on_death_explode: boolean,
        /**
         * if true, emits on_death_emit_particle_type on death
         * - Hints: 0 [0, 1]
         */
        on_death_emit_particle: boolean,
        /**
         * how many particles should we emit
         * - Hints: 1 [0, 1]
         */
        on_death_emit_particle_count: number,
        /**
         * if true, dies on collision with liquids
         * - Hints: 0 [0, 1]
         */
        die_on_liquid_collision: boolean,
        /**
         * if true, dies when speed goes below die_on_low_velocity_limit
         * - Hints: 0 [0, 1]
         */
        die_on_low_velocity: boolean,
        /**
         * please see die_on_low_velocity
         * - Hints: 50 [0, 1]
         */
        die_on_low_velocity_limit: number,
        /**
         */
        on_death_emit_particle_type: string,
        /**
         * if you want it to stick as concrete, you should enable this
         * - Hints: 0 [0, 1]
         */
        on_death_particle_check_concrete: boolean,
        /**
         * if 1, spurt some particles when colliding with mortals
         * - Hints: 1 [0, 1]
         */
        ground_collision_fx: boolean,
        /**
         * if true, explosion doesn't damage the entity who shot this
         * - Hints: 0 [0, 1]
         */
        explosion_dont_damage_shooter: boolean,
        /**
         * if > 0, makes items closer than this radius pickable on death
         * - Hints: 0 [0, 1]
         */
        on_death_item_pickable_radius: number,
        /**
         * if true, the projectile doesn't collide with ground, liquids, physical objects etc
         * - Hints: 0 [0, 1]
         */
        penetrate_world: boolean,
        /**
         * if 'penetrate_world' is true, the projectile moves with a velocity multiplied by this value when inside world
         * - Hints: 0.6 [0, 1]
         */
        penetrate_world_velocity_coeff: number,
        /**
         * if true, the projectile doesn't stop when it collides with entities. damages each entity only once
         * - Hints: 0 [0, 1]
         */
        penetrate_entities: boolean,
        /**
         * if true, this is killed as soon as it hits the ground
         * - Hints: 1 [0, 1]
         */
        on_collision_die: boolean,
        /**
         * if true, ProjectileComponent is removed from the entitiy
         * - Hints: 0 [0, 1]
         */
        on_collision_remove_projectile: boolean,
        /**
         * if true, spawns the spawn_entity
         * - Hints: 1 [0, 1]
         */
        on_collision_spawn_entity: boolean,
        /**
         * this is spawned if hit something an on_collision_spawn_entity = 1
         */
        spawn_entity: string,
        /**
         * if true, will use ShootProjectile instead of LoadEntity()
         * - Hints: 0 [0, 1]
         */
        spawn_entity_is_projectile: boolean,
        /**
         * projectile applies an impulse to physics bodies it hits. Impulse = physics_impulse_coeff * velocity
         * - Hints: 300 [0, 1]
         */
        physics_impulse_coeff: number,
        /**
         * if set != -1, will only do damage every x frames, used for fields and such, which would otherwise do damage every frame
         * - Hints: -1 [0, 1]
         */
        damage_every_x_frames: number,
        /**
         * if 1, damage is multiplied by (projectile speed / original projectile speed) ratio
         * - Hints: 0 [0, 1]
         */
        damage_scaled_by_speed: boolean,
        /**
         * if > 0 and damage_scaled_by_speed = 1, will use this instead of mInitialSpeed when calculating the damage
         * - Hints: 0 [0, 1]
         */
        damage_scale_max_speed: number,
        /**
         * if 1, looks for entities with tag, collide_with_tag and collides with them, giving them damage
         * - Hints: 1 [0, 1]
         */
        collide_with_entities: boolean,
        /**
         * default: mortal, if you needed can be changed to something more specific
         * - Hints: hittable [0, 1]
         */
        collide_with_tag: string,
        /**
         * if set will ignore entities with this tag
         */
        dont_collide_with_tag: string,
        /**
         * remember friendly_fire 1, if -1 won't collide with shooter at all, otherwise uses the value as frame count and while it's running won't damage the shooter 
         * - Hints: -1 [0, 1]
         */
        collide_with_shooter_frames: number,
        /**
         * if true, will damage same herd id
         * - Hints: 0 [0, 1]
         */
        friendly_fire: boolean,
        /**
         * how much Projectile damage does this do when it hits something
         * - Hints: 1 [0, 1]
         */
        damage: number,
        /**
         * How far do entities get thrown if a knockback occurs. final_knockback = ProjectileComponent.knockback_force * VelocityComponent.mVelocity * VelocityComponent.mass / who_we_hit.mass
         * - Hints: 0 [0, 1]
         */
        knockback_force: number,
        /**
         * velocity * ragdoll_force_multiplier is applied to any ragdolls that are created by entities killed by this
         * - Hints: 0.025 [0, 1]
         */
        ragdoll_force_multiplier: number,
        /**
         * hit particle velocity = projectile_velocity * hit_particle_force_multiplier * some randomness
         * - Hints: 0.1 [0, 1]
         */
        hit_particle_force_multiplier: number,
        /**
         * how much blood does this projectile cause
         * - Hints: 1 [0, 1]
         */
        blood_count_multiplier: number,
        /**
         * a list of game_effects entities separated with ','. e.g. 'data/entities/misc/effect_electrocution.xml,data/entities/misc/effect_on_fire.xml' 
         */
        damage_game_effect_entities: string,
        /**
         * If 1, does not hit player no matter what herds this and player belong to
         * - Hints: 0 [0, 1]
         */
        never_hit_player: boolean,
        /**
         * if 1, looks up the 'who_shot' entity and its MaterialInventoryComponent on destruction and updates it based on the cells destroyed on our explosion.
         * - Hints: 0 [0, 1]
         */
        collect_materials_to_shooter: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        play_damage_sounds: boolean,
        /**
         * - Hints: -1024 [0, 1]
         */
        mLastFrameDamaged: number,
        /**
         */
        config: ComponentTypeMap['ConfigGunActionInfo'],
        /**
         * if we have explosion, it's the setup for it
         */
        config_explosion: ComponentTypeMap['ConfigExplosion'],
        /**
         * the amounts of different types of damage this does
         */
        damage_by_type: ComponentTypeMap['ConfigDamagesByType'],
        /**
         * config for critical hit
         */
        damage_critical: ComponentTypeMap['ConfigDamageCritical'],
        /**
         */
        projectile_type: ComponentTypeMap['PROJECTILE_TYPE::Enum'],
        /**
         * where the shell casing will be created relative to projectile, y is flipped if projectile direction is to the left.
         */
        shell_casing_offset: ComponentTypeMap['vec2'],
        /**
         * if not NORMAL, do a special ragdoll
         */
        ragdoll_fx_on_collision: ComponentTypeMap['RAGDOLL_FX::Enum'],
        /**
         * entity (creature) that shot this
         * - Hints: 0 [0, 1]
         */
        mWhoShot: ComponentTypeMap['EntityID'],
        /**
         * used for stats
         * - Hints: 0 [0, 1]
         */
        mWhoShotEntityTypeID: ComponentTypeMap['EntityTypeID'],
        /**
         * the herdid of mWhoShot, unless friendly fire
         * - Hints: 0 [0, 1]
         */
        mShooterHerdId: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStartingLifetime: number,
        /**
         * for triggers, if shot from a trigger this should point to the projectile entity that shot this. Otherwise this should be the same as mWhoShot. NOTE! Not really tested properly so might break.
         * - Hints: 0 [0, 1]
         */
        mEntityThatShot: ComponentTypeMap['EntityID'],
        /**
         */
        mTriggers: ComponentTypeMap['ProjectileTriggers'],
        /**
         */
        mDamagedEntities: ComponentTypeMap['VEC_ENTITY'],
        /**
         * - Hints: -1 [0, 1]
         */
        mInitialSpeed: number,
    };
    RotateTowardsComponent: {
        /**
         * will rotate this entity towards the closest entity with tag
         * - Hints: player_unit [0, 1]
         */
        entity_with_tag: string,
    };
    SetLightAlphaFromVelocityComponent: {
        /**
         * - Hints: 50 [1, 150]
         */
        max_velocity: number,
        /**
         */
        mPrevPosition: ComponentTypeMap['vec2'],
    };
    SetStartVelocityComponent: {
        /**
         * This is added together with random velocity
         */
        velocity: ComponentTypeMap['vec2'],
        /**
         * Random angle min max range in radians, clockwise. 0.0 points directly rightward.
         */
        randomize_angle: ComponentTypeMap['ValueRange'],
        /**
         * Random speed min max range
         */
        randomize_speed: ComponentTypeMap['ValueRange'],
    };
    ShotEffectComponent: {
        /**
         * name of modifier function executed per projectile from 'gun_extra_modifiers.lua'
         */
        extra_modifier: string,
        /**
         * Shooting entity needs to have this 'GAME_EFFECT' for effects to apply. If both 'condition_effect' and 'condition_status' are set, they are combined with AND logic
         */
        condition_effect: ComponentTypeMap['GAME_EFFECT::Enum'],
        /**
         * Shooting entity needs to have this 'STATUS_EFFECT' for effects to apply
         * - Hints: 0 [0, 1]
         */
        condition_status: ComponentTypeMap['StatusEffectType'],
    };
    SimplePhysicsComponent: {
        /**
         * if set, will not try to move this upwards
         * - Hints: 1 [0, 1]
         */
        can_go_up: boolean,
        /**
         * used for box2d simple physics
         */
        mOldPosition: ComponentTypeMap['vec2'],
    };
    SineWaveComponent: {
        /**
         * sinewave_m * sinf( sinewave_freq * lifetime++)
         * - Hints: 1 [0, 1]
         */
        sinewave_freq: number,
        /**
         * sinewave_m * sinf( sinewave_freq * lifetime++)
         * - Hints: 0.6 [0, 1]
         */
        sinewave_m: number,
        /**
         * -1 seems to fix some problems with this... sinewave_m * sinf( sinewave_freq * lifetime++)
         * - Hints: -1 [0, 1]
         */
        lifetime: number,
    };
    SpriteAnimatorComponent: {
        /**
         * - Hints: character [0, 1]
         */
        target_sprite_comp_name: string,
        /**
         * - Hints: 0 [0, 1]
         */
        rotate_to_surface_normal: boolean,
        /**
         */
        mStates: ComponentTypeMap['STACK_ANIMATIONSTATE'],
        /**
         */
        mCachedTargetSpriteTag: ComponentTypeMap['ComponentTags'],
        /**
         */
        mSendOnFinishedMessageName: string,
    };
    SpriteComponent: {
        /**
         * - Hints: data/temp/temp_gun.png [0, 1]
         */
        image_file: string,
        /**
         * Adds this to the GG.GetUISprite() as a child, instead of the mSpriteContainer
         * - Hints: 0 [0, 1]
         */
        ui_is_parent: boolean,
        /**
         * if you want to load a text sprite, set this to true and image_file to a font file
         * - Hints: 0 [0, 1]
         */
        is_text_sprite: boolean,
        /**
         * - Hints: 0 [-24, 24]
         */
        offset_x: number,
        /**
         * - Hints: 0 [-24, 24]
         */
        offset_y: number,
        /**
         * - Hints: 1 [0, 1]
         */
        alpha: number,
        /**
         * - Hints: 1 [0, 1]
         */
        visible: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        emissive: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        additive: boolean,
        /**
         * if 1, the alpha channel of this texture punctures a hole in the fog of war
         * - Hints: 0 [0, 1]
         */
        fog_of_war_hole: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        smooth_filtering: boolean,
        /**
         */
        rect_animation: string,
        /**
         */
        next_rect_animation: string,
        /**
         */
        text: string,
        /**
         * 0 = world grid, -1 = enemies, -1.5 = items in world, player = 0.6
         * - Hints: 1 [-256, 256]
         */
        z_index: number,
        /**
         * - Hints: 1 [0, 1]
         */
        update_transform: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        update_transform_rotation: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        kill_entity_after_finished: boolean,
        /**
         * if this is set, sets special_scale_x and _y to scale
         * - Hints: 0 [0, 1]
         */
        has_special_scale: boolean,
        /**
         * this overrides the scale of the entity, if has_special_scale
         * - Hints: 1 [0, 1]
         */
        special_scale_x: number,
        /**
         * this overrides the scale of the entity, if has_special_scale
         * - Hints: 1 [0, 1]
         */
        special_scale_y: number,
        /**
         * - Hints: 0 [0, 1]
         */
        never_ragdollify_on_death: boolean,
        /**
         */
        transform_offset: ComponentTypeMap['vec2'],
        /**
         * used by SpriteOffsetAnimator
         */
        offset_animator_offset: ComponentTypeMap['vec2'],
        /**
         */
        mSprite: ComponentTypeMap['as::Sprite*'],
        /**
         */
        mRenderList: ComponentTypeMap['SpriteRenderList*'],
        /**
         * - Hints: -1 [0, 1]
         */
        mRenderListHandle: ComponentTypeMap['int32'],
    };
    SpriteOffsetAnimatorComponent: {
        /**
         * - Hints: 0 [0, 5]
         */
        x_amount: number,
        /**
         * - Hints: 0 [0, 5]
         */
        x_speed: number,
        /**
         * - Hints: 2 [0, 5]
         */
        y_amount: number,
        /**
         * - Hints: 2 [0, 5]
         */
        y_speed: number,
        /**
         * - Hints: 0 [0, 8]
         */
        sprite_id: number,
        /**
         * - Hints: 16 [0, 32]
         */
        x_phase: number,
        /**
         * - Hints: 0 [0, 1]
         */
        x_phase_offset: number,
    };
    SpriteParticleEmitterComponent: {
        /**
         * filepath to the sprite(s), supports the $[0-3] syntax
         */
        sprite_file: string,
        /**
         * sets the offset to the center of the image
         * - Hints: 0 [0, 1]
         */
        sprite_centered: boolean,
        /**
         * rotates the sprite randomly in 90 degree angles
         * - Hints: 0 [0, 1]
         */
        sprite_random_rotation: boolean,
        /**
         * if true, will set this particle to be behind entities (won't emit light)
         * - Hints: 0 [0, 1]
         */
        render_back: boolean,
        /**
         * delay in seconds...
         * - Hints: 0 [0, 1]
         */
        delay: number,
        /**
         * lifetime in seconds...
         * - Hints: 0 [0, 1]
         */
        lifetime: number,
        /**
         * if 1, the sprites will be rendered using additive blending
         * - Hints: 0 [0, 1]
         */
        additive: boolean,
        /**
         * if 1, the sprites will be rendered onto the emissive render target
         * - Hints: 0 [0, 1]
         */
        emissive: boolean,
        /**
         * what percent of the velocity is slowed by *dt
         * - Hints: 0 [0, 1]
         */
        velocity_slowdown: number,
        /**
         * original rotation in rads
         * - Hints: 0 [0, 1]
         */
        rotation: number,
        /**
         * how much rotation there is in a second
         * - Hints: 0 [0, 1]
         */
        angular_velocity: number,
        /**
         * do we rotate the sprite based on the velocity
         * - Hints: 0 [0, 1]
         */
        use_velocity_as_rotation: boolean,
        /**
         * if set, will set the initial rotation based on the velocity component's velocity
         * - Hints: 0 [0, 1]
         */
        use_rotation_from_velocity_component: boolean,
        /**
         * if set, will 'inherit' rotation from the entity
         * - Hints: 0 [0, 1]
         */
        use_rotation_from_entity: boolean,
        /**
         * 0 = doesn't use the velocity from spawning entity at all, 1 = uses all
         * - Hints: 0 [0, 1]
         */
        entity_velocity_multiplier: number,
        /**
         * Depth of created particles
         * - Hints: 0 [0, 1]
         */
        z_index: number,
        /**
         * if set, will randomize position inside the hitbox aabb
         * - Hints: 0 [0, 1]
         */
        randomize_position_inside_hitbox: boolean,
        /**
         * if set, will make the velocity's rotation always away from center of randomized aabb
         * - Hints: 0 [0, 1]
         */
        velocity_always_away_from_center: boolean,
        /**
         * if true, will be culled if not near the camera
         * - Hints: 1 [0, 1]
         */
        camera_bound: boolean,
        /**
         * if the distance from camera (edges) is higher than this, this will be culled
         * - Hints: 75 [0, 1]
         */
        camera_distance: number,
        /**
         * disable this from emitting...
         * - Hints: 1 [0, 1]
         */
        is_emitting: boolean,
        /**
         * how many particles do we spawn at one time
         * - Hints: 0 [0, 1]
         */
        count_min: number,
        /**
         * how many particles do we spawn at one time
         * - Hints: 1 [0, 1]
         */
        count_max: number,
        /**
         * how often do we emit particles
         * - Hints: 5 [0, 200]
         */
        emission_interval_min_frames: number,
        /**
         * how often do we emit particles
         * - Hints: 10 [0, 200]
         */
        emission_interval_max_frames: number,
        /**
         * if set, this entity is loaded to the emission position by the emitter when it emits
         */
        entity_file: string,
        /**
         * original color
         */
        color: ComponentTypeMap['types::fcolor'],
        /**
         * how much the color changes in a second
         */
        color_change: ComponentTypeMap['types::fcolor'],
        /**
         * original velocity
         */
        velocity: ComponentTypeMap['vec2'],
        /**
         * gravity
         */
        gravity: ComponentTypeMap['vec2'],
        /**
         * original scale
         */
        scale: ComponentTypeMap['vec2'],
        /**
         * scale velocity per second
         */
        scale_velocity: ComponentTypeMap['vec2'],
        /**
         * this is added to the lifetime
         */
        randomize_lifetime: ComponentTypeMap['ValueRange'],
        /**
         * random offset for pos
         */
        randomize_position: ComponentTypeMap['types::aabb'],
        /**
         * add this randomized velocity inside this o the velocity
         */
        randomize_velocity: ComponentTypeMap['types::aabb'],
        /**
         * add this randomized vector2 to scale
         */
        randomize_scale: ComponentTypeMap['types::aabb'],
        /**
         * this is added to the rotation 
         */
        randomize_rotation: ComponentTypeMap['ValueRange'],
        /**
         * this is added to angular_velocity
         */
        randomize_angular_velocity: ComponentTypeMap['ValueRange'],
        /**
         * this is added to the alpha
         */
        randomize_alpha: ComponentTypeMap['ValueRange'],
        /**
         * if set, animation speed is multiplied by a random value inside this range
         */
        randomize_animation_speed_coeff: ComponentTypeMap['ValueRange'],
        /**
         * will add dt*this to randomize_position_aabb every frame
         */
        expand_randomize_position: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mNextEmitFrame: number,
    };
    SpriteStainsComponent: {
        /**
         * which sprite (in the order in which they appear in the entity) are we going to stain?
         * - Hints: 0 [0, 10]
         */
        sprite_id: number,
        /**
         * if 1, shades get less opaque near the top of the sprite
         * - Hints: 1 [0, 1]
         */
        fade_stains_towards_srite_top: boolean,
        /**
         * how quickly stains are dropped relative to normal drop speed
         */
        stain_shaken_drop_chance_multiplier: ComponentTypeMap['LensValue<int>'],
        /**
         */
        mData: ComponentTypeMap['SpriteStains*'],
        /**
         */
        mTextureHandle: ComponentTypeMap['VirtualTextureHandle'],
        /**
         */
        mState: ComponentTypeMap['SpriteStainsState'],
    };
    StatusEffectDataComponent: {
        /**
         */
        stain_effects: ComponentTypeMap['VECTOR_FLOAT'],
        /**
         */
        stain_effect_cooldowns: ComponentTypeMap['VECTOR_INT32'],
        /**
         */
        effects_previous: ComponentTypeMap['VECTOR_FLOAT'],
        /**
         */
        ingestion_effects: ComponentTypeMap['VECTOR_FLOAT'],
        /**
         */
        ingestion_effect_causes: ComponentTypeMap['VEC_OF_MATERIALS'],
        /**
         */
        ingestion_effect_causes_many: ComponentTypeMap['VECTOR_INT32'],
        /**
         * - Hints: -99999 [0, 1]
         */
        mLastAttackingPlayerFrame: number,
        /**
         */
        mStainEffectsSmoothedForUI: ComponentTypeMap['VECTOR_FLOAT'],
        /**
         * - Hints: 0 [0, 1]
         */
        mHasChildIconsCached: boolean,
    };
    StreamingKeepAliveComponent: {
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMPY: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        TEMP_TEMP_TEMP: number,
    };
    TelekinesisComponent: {
        /**
         * Minimum size of physics body that can be grabbed, in cells/pixels
         * - Hints: 7 [0, 1]
         */
        min_size: ComponentTypeMap['uint32'],
        /**
         * Maximum size of physics body that can be grabbed, in cells/pixels
         * - Hints: 1500 [0, 1]
         */
        max_size: ComponentTypeMap['uint32'],
        /**
         * Maximum object search distance
         * - Hints: 250 [0, 300]
         */
        radius: number,
        /**
         * Affects object speed when it is thrown
         * - Hints: 25 [0, 300]
         */
        throw_speed: number,
        /**
         * Affects how far objects float from owner when held. Object size will also affect the floating distance.
         * - Hints: 6 [0, 30]
         */
        target_distance: number,
        /**
         * If 1, telekinesis interaction will occur when kick input is detected in root entity's ControlsComponent
         * - Hints: 1 [0, 1]
         */
        kick_to_use: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mState: ComponentTypeMap['int32'],
        /**
         * - Hints: 0 [0, 1]
         */
        mBodyID: ComponentTypeMap['uint64'],
        /**
         * - Hints: 0 [0, 1]
         */
        mStartBodyMaxExtent: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStartAimAngle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStartBodyAngle: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStartBodyDistance: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mStartTime: number,
        /**
         * - Hints: 3.40282e+038 [0, 1]
         */
        mMinBodyDistance: number,
        /**
         * If set to true, telekinesis interaction will occur. Will automatically turn to false at the end of component update.
         * - Hints: 0 [0, 1]
         */
        mInteract: boolean,
    };
    TeleportComponent: {
        /**
         * If set, target position x is in world coordinates, otherwise it's an offset
         * - Hints: 0 [0, 1]
         */
        target_x_is_absolute_position: boolean,
        /**
         * If set, target position y is in world coordinates, otherwise it's an offset
         * - Hints: 0 [0, 1]
         */
        target_y_is_absolute_position: boolean,
        /**
         * This entity is loaded at the source position when teleportation occurs
         * - Hints: data/entities/particles/teleportation_source.xml [0, 1]
         */
        source_particle_fx_file: string,
        /**
         * This entity is loaded at the target position when teleportation occurs
         * - Hints: data/entities/particles/teleportation_target.xml [0, 1]
         */
        target_particle_fx_file: string,
        /**
         * if we don't want things to collapse after the teleport
         * - Hints: 1 [0, 1]
         */
        load_collapse_entity: boolean,
        /**
         * Where should we teleport
         */
        target: ComponentTypeMap['vec2'],
        /**
         * used to keep track that we're not stuck in waiting for a pixel scene to load, that is not going to be loaded
         * - Hints: 0 [0, 1]
         */
        safety_counter: number,
        /**
         */
        state: ComponentTypeMap['TeleportComponentState::Enum'],
        /**
         */
        teleported_entities: ComponentTypeMap['ENTITY_VEC'],
        /**
         */
        source_location_camera_aabb: ComponentTypeMap['types::aabb'],
    };
    TeleportProjectileComponent: {
        /**
         * - Hints: 16 [0, 16]
         */
        min_distance_from_wall: number,
        /**
         * - Hints: 3 [0, 20]
         */
        actionable_lifetime: number,
        /**
         * If 1, will set shooter y velocity to 0 on teleport
         * - Hints: 1 [0, 1]
         */
        reset_shooter_y_vel: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mWhoShot: ComponentTypeMap['EntityID'],
    };
    TextLogComponent: {
        /**
         */
        key: string,
        /**
         */
        image_filename: string,
        /**
         */
        mCachedName: string,
    };
    TorchComponent: {
        /**
         * how likely are we to ignite colliding cells
         * - Hints: 15 [0, 100]
         */
        probability_of_ignition_attempt: number,
        /**
         * check offset in world coordinates from our position
         * - Hints: -2 [-10, 10]
         */
        suffocation_check_offset_y: number,
        /**
         * how many frames the torch needs to be suffocated before it stops emitting fire
         * - Hints: 5 [0, 30]
         */
        frames_suffocated_to_extinguish: number,
        /**
         * if 1, the torch needs to be re-ignited in case it is turned off
         * - Hints: 1 [0, 1]
         */
        extinguishable: boolean,
        /**
         * how loud is the sound of our fire? 0 = no sound
         * - Hints: 0 [0, 2]
         */
        fire_audio_weight: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFlickerOffset: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFramesSuffocated: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mIsOn: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mFireIsBurningPrev: boolean,
    };
    UIIconComponent: {
        /**
         */
        icon_sprite_file: string,
        /**
         */
        name: string,
        /**
         */
        description: string,
        /**
         * - Hints: 0 [0, 1]
         */
        display_above_head: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        display_in_hud: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        is_perk: boolean,
    };
    UIInfoComponent: {
        /**
         */
        name: string,
    };
    VariableStorageComponent: {
        /**
         */
        name: string,
        /**
         */
        value_string: string,
        /**
         * - Hints: 0 [0, 1]
         */
        value_int: number,
        /**
         * - Hints: 0 [0, 1]
         */
        value_bool: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        value_float: number,
    };
    VelocityComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        gravity_x: number,
        /**
         * - Hints: 400 [0, 1]
         */
        gravity_y: number,
        /**
         * - Hints: 0.05 [0, 10]
         */
        mass: number,
        /**
         * - Hints: 0.55 [0, 1]
         */
        air_friction: number,
        /**
         * - Hints: 1000 [0, 1]
         */
        terminal_velocity: number,
        /**
         * - Hints: 1 [0, 1]
         */
        apply_terminal_velocity: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        updates_velocity: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        displace_liquid: boolean,
        /**
         * if true, will move the physics body by the difference of mVelocity to the previous frame
         * - Hints: 0 [0, 1]
         */
        affect_physics_bodies: boolean,
        /**
         * if true will limit the velocity to 61440. You can turn this off, but it's not recommended, since there are some nasty bugs that can happen with extremely high velocities.
         * - Hints: 1 [0, 1]
         */
        limit_to_max_velocity: boolean,
        /**
         * if > 0, entity will die if liquid hit count is greater than this.
         * - Hints: 0 [0, 1]
         */
        liquid_death_threshold: number,
        /**
         * 1 = slows down in liquid, 0 = doesn't slow down at all
         * - Hints: 1 [0, 1]
         */
        liquid_drag: number,
        /**
         */
        mVelocity: ComponentTypeMap['vec2'],
        /**
         * used to update physics bodies
         */
        mPrevVelocity: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mLatestLiquidHitCount: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mAverageLiquidHitCount: number,
        /**
         */
        mPrevPosition: ComponentTypeMap['ivec2'],
    };
    VerletPhysicsComponent: {
        /**
         * - Hints: 2 [0, 1]
         */
        num_points: number,
        /**
         * - Hints: 2 [0, 1]
         */
        num_links: number,
        /**
         * - Hints: 1 [0, 1]
         */
        width: number,
        /**
         * - Hints: 2 [0, 16]
         */
        resting_distance: number,
        /**
         * - Hints: 0.8 [0.03, 2]
         */
        mass_min: number,
        /**
         * - Hints: 1 [0.03, 2]
         */
        mass_max: number,
        /**
         * - Hints: 1 [0, 1]
         */
        stiffness: number,
        /**
         * - Hints: 0.99 [0.2, 1]
         */
        velocity_dampening: number,
        /**
         * how much we dampen when in liquid
         * - Hints: 0.7 [0, 1]
         */
        liquid_damping: number,
        /**
         * - Hints: 0 [0, 10]
         */
        gets_entity_velocity_coeff: number,
        /**
         * - Hints: 1 [0, 1]
         */
        collide_with_cells: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        simulate_gravity: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        simulate_wind: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        wind_change_speed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        constrain_stretching: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        pixelate_sprite_transforms: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        scale_sprite_x: boolean,
        /**
         * - Hints: 1 [0, 1]
         */
        follow_entity_transform: boolean,
        /**
         * - Hints: 2 [0, 1]
         */
        animation_amount: number,
        /**
         * - Hints: 5 [0, 1]
         */
        animation_speed: number,
        /**
         * - Hints: 0.6 [0, 1]
         */
        animation_energy: number,
        /**
         * - Hints: 1 [0, 1]
         */
        cloth_sprite_z_index: number,
        /**
         * 0 = never, 1 = most likely, 10 = less likely - and so on
         * - Hints: 0 [0, 1]
         */
        stain_cells_probability: number,
        /**
         * Developer note: this needs to be serialized in case we serialize SpriteComponent.is_visible
         * - Hints: 0 [0, 1]
         */
        m_is_culled_previous: boolean,
        /**
         */
        type: ComponentTypeMap['VERLET_TYPE::Enum'],
        /**
         */
        animation_target_offset: ComponentTypeMap['vec2'],
        /**
         * - Hints: 4288376730 [0, 1]
         */
        cloth_color_edge: ComponentTypeMap['uint32'],
        /**
         * - Hints: 4286534774 [0, 1]
         */
        cloth_color: ComponentTypeMap['uint32'],
        /**
         */
        m_position_previous: ComponentTypeMap['vec2'],
        /**
         */
        colors: ComponentTypeMap['UintArrayInline'],
        /**
         */
        materials: ComponentTypeMap['UintArrayInline'],
        /**
         */
        masses: ComponentTypeMap['FloatArrayInline'],
        /**
         */
        positions: ComponentTypeMap['Vec2ArrayInline'],
        /**
         */
        positions_prev: ComponentTypeMap['Vec2ArrayInline'],
        /**
         */
        velocities: ComponentTypeMap['Vec2ArrayInline'],
        /**
         */
        dampenings: ComponentTypeMap['FloatArrayInline'],
        /**
         */
        freedoms: ComponentTypeMap['FloatArrayInline'],
        /**
         */
        links: ComponentTypeMap['VerletLinkArrayInline'],
        /**
         */
        sprite: ComponentTypeMap['VerletSprite*'],
    };
    VerletWeaponComponent: {
        /**
         * - Hints: 5 [0, 10]
         */
        damage_radius: number,
        /**
         * - Hints: 3 [0, 10]
         */
        physics_force_radius: number,
        /**
         * - Hints: 0.01 [0, 3.5]
         */
        damage_min_step: number,
        /**
         * - Hints: 1 [0, 3.5]
         */
        damage_max: number,
        /**
         * - Hints: 1 [0, 3.5]
         */
        damage_coeff: number,
        /**
         * - Hints: 1 [0, 3.5]
         */
        impulse_coeff: number,
        /**
         * - Hints: 10 [0, 100]
         */
        fade_duration_frames: number,
        /**
         * - Hints: 1 [0, 3.5]
         */
        physics_impulse_coeff: number,
        /**
         * - Hints: -1 [0, 1]
         */
        mPlayerCooldownEnd: number,
    };
    VerletWorldJointComponent: {
        /**
         * Index of the verlet point we attach
         * - Hints: 0 [0, 32]
         */
        verlet_point_index: number,
        /**
         * Where we attach the verlet point
         */
        world_position: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mUpdated: boolean,
        /**
         */
        mCell: ComponentTypeMap['grid::ICell*'],
    };
    WalletComponent: {
        /**
         * - Hints: 0 [0, 10000]
         */
        money: ComponentTypeMap['int64'],
        /**
         * tracks how much money the player has spent
         * - Hints: 0 [0, 1]
         */
        money_spent: ComponentTypeMap['int64'],
        /**
         * HAX to give player towards infinite moneys
         * - Hints: 0 [0, 1]
         */
        mMoneyPrevFrame: ComponentTypeMap['int64'],
        /**
         * once it hits this value... keep it there
         * - Hints: 0 [0, 1]
         */
        mHasReachedInf: boolean,
    };
    WalletValuableComponent: {
        /**
         * - Hints: 10 [0, 100]
         */
        money_value: number,
    };
    WorldStateComponent: {
        /**
         * - Hints: 0 [0, 1]
         */
        is_initialized: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        time: number,
        /**
         * - Hints: 0 [0, 1000]
         */
        time_total: number,
        /**
         * to make the time go really fast or slow?
         * - Hints: 1 [0, 1000]
         */
        time_dt: number,
        /**
         * - Hints: 0 [0, 3.5]
         */
        day_count: number,
        /**
         * should be called clouds, controls amount of cloud cover in the sky
         * - Hints: 0 [0, 1]
         */
        rain: number,
        /**
         * should be called clouds_target, controls amount of cloud cover in the sky
         * - Hints: 0 [0, 1]
         */
        rain_target: number,
        /**
         * - Hints: 0 [0, 1]
         */
        fog: number,
        /**
         * - Hints: 0 [0, 1]
         */
        fog_target: number,
        /**
         * if set, will set the weather to be nice all the time
         * - Hints: 0 [0, 1]
         */
        intro_weather: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        wind: number,
        /**
         * - Hints: 2 [-50, 50]
         */
        wind_speed: number,
        /**
         * - Hints: 10 [0, 1]
         */
        wind_speed_sin_t: number,
        /**
         * - Hints: 3 [-50, 50]
         */
        wind_speed_sin: number,
        /**
         * - Hints: 0 [-27, 100]
         */
        clouds_01_target: number,
        /**
         * - Hints: 0 [-100, 185]
         */
        clouds_02_target: number,
        /**
         * - Hints: 0 [0, 1]
         */
        gradient_sky_alpha_target: number,
        /**
         * - Hints: 1 [0, 1]
         */
        sky_sunset_alpha_target: number,
        /**
         * this gets decreased to 0, this is the frame count of how many times do we do our awesome lightning effect
         * - Hints: 0 [0, 100]
         */
        lightning_count: number,
        /**
         * - Hints: 1 [0, 1]
         */
        next_portal_id: ComponentTypeMap['uint32'],
        /**
         * if empty, we'll create one. This tracks the play time, death, kills... etch
         */
        session_stat_file: string,
        /**
         * how many times player has been polymorphed
         * - Hints: 0 [0, 1]
         */
        player_polymorph_count: number,
        /**
         * how many times player has been random polymorphed
         * - Hints: 0 [0, 1]
         */
        player_polymorph_random_count: number,
        /**
         * how many times player has done a secret trick
         * - Hints: 0 [0, 1]
         */
        player_did_infinite_spell_count: number,
        /**
         * how many times player has player done damage of over 1000000
         * - Hints: 0 [0, 1]
         */
        player_did_damage_over_1milj: number,
        /**
         * how many times player has been detected with minus health
         * - Hints: 0 [0, 1]
         */
        player_living_with_minus_hp: number,
        /**
         * Genome_GetHerdRelation adds this value to the results. 100 = good relations, 0 is bad 
         * - Hints: 0 [0, 1]
         */
        global_genome_relations_modifier: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mods_have_been_active_during_this_run: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        twitch_has_been_active_during_this_run: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        next_cut_through_world_id: ComponentTypeMap['uint32'],
        /**
         * if true, almost all spells will have unlimited uses. (black holes, matter eater, heals excluded
         * - Hints: 0 [0, 1]
         */
        perk_infinite_spells: boolean,
        /**
         * if true, trick kills will produce blood money (heals player)
         * - Hints: 0 [0, 1]
         */
        perk_trick_kills_blood_money: boolean,
        /**
         * if > 0, then there's chance that killing an enemy will drop bloodmoney_50
         * - Hints: 0 [0, 1]
         */
        perk_hp_drop_chance: number,
        /**
         * drop_money.lua - checks if this is true and removes Lifetime_Component from gold nuggets
         * - Hints: 0 [0, 1]
         */
        perk_gold_is_forever: boolean,
        /**
         * if 1, rats don't attack player herd and the other way round. this is a persistent change
         * - Hints: 0 [0, 1]
         */
        perk_rats_player_friendly: boolean,
        /**
         * if true everything will be gold + used to track if the wallet should go to infinite
         * - Hints: 0 [0, 1]
         */
        EVERYTHING_TO_GOLD: boolean,
        /**
         * - Hints: gold [0, 1]
         */
        material_everything_to_gold: string,
        /**
         * - Hints: gold_static [0, 1]
         */
        material_everything_to_gold_static: string,
        /**
         * the secret ending with infinite gold
         * - Hints: 0 [0, 1]
         */
        INFINITE_GOLD_HAPPENING: boolean,
        /**
         * if true, will do the animations for happiness ending
         * - Hints: 0 [0, 1]
         */
        ENDING_HAPPINESS_HAPPENING: boolean,
        /**
         * to keep track of the animation
         * - Hints: 0 [0, 1]
         */
        ENDING_HAPPINESS_FRAMES: number,
        /**
         * this is set if ending happiness has happened
         * - Hints: 0 [0, 1]
         */
        ENDING_HAPPINESS: boolean,
        /**
         * to keep track of the animation
         * - Hints: 0 [0, 1]
         */
        mFlashAlpha: number,
        /**
         * how many times have loaded from autosaves
         * - Hints: 0 [0, 1]
         */
        DEBUG_LOADED_FROM_AUTOSAVE: number,
        /**
         * how many times have we loaded from an old version of the game
         * - Hints: 0 [0, 1]
         */
        DEBUG_LOADED_FROM_OLD_VERSION: number,
        /**
         */
        player_spawn_location: ComponentTypeMap['vec2'],
        /**
         */
        lua_globals: ComponentTypeMap['MAP_STRING_STRING'],
        /**
         */
        pending_portals: ComponentTypeMap['VEC_PENDINGPORTAL'],
        /**
         */
        apparitions_per_level: ComponentTypeMap['VECTOR_INT32'],
        /**
         */
        npc_parties: ComponentTypeMap['VEC_NPCPARTY'],
        /**
         */
        orbs_found_thisrun: ComponentTypeMap['VECTOR_INT32'],
        /**
         */
        flags: ComponentTypeMap['VECTOR_STRING'],
        /**
         * pairs of materials changed via ConvertMaterialEverywhere(). stored so these can be restored when loading a save
         */
        changed_materials: ComponentTypeMap['VECTOR_STRING'],
        /**
         */
        cuts_through_world: ComponentTypeMap['VEC_CUTTHROUGHWORLD'],
        /**
         */
        gore_multiplier: ComponentTypeMap['LensValue<int>'],
        /**
         */
        trick_kill_gold_multiplier: ComponentTypeMap['LensValue<int>'],
        /**
         */
        damage_flash_multiplier: ComponentTypeMap['LensValue<float>'],
        /**
         * same as the trailer mode, open fog of war everywhere
         */
        open_fog_of_war_everywhere: ComponentTypeMap['LensValue<bool>'],
        /**
         * same as the trailer mode, spells with limited uses are not consumed if this is false
         */
        consume_actions: ComponentTypeMap['LensValue<bool>'],
        /**
         * - Hints: 0 [0, 1]
         */
        rain_target_extra: number,
        /**
         * - Hints: 0 [0, 1]
         */
        fog_target_extra: number,
        /**
         * - Hints: 0 [0, 1]
         */
        perk_rats_player_friendly_prev: boolean,
    };
    WormAIComponent: {
        /**
         * - Hints: 1 [0, 10000]
         */
        speed: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        speed_hunt: number,
        /**
         * - Hints: 1 [0, 10000]
         */
        direction_adjust_speed: number,
        /**
         * - Hints: 1 [0, 10000]
         */
        direction_adjust_speed_hunt: number,
        /**
         * - Hints: 512 [0, 10000]
         */
        random_target_box_radius: number,
        /**
         * - Hints: 30 [0, 10000]
         */
        new_hunt_target_check_every: number,
        /**
         * - Hints: 120 [0, 10000]
         */
        new_random_target_check_every: number,
        /**
         * - Hints: 512 [0, 10000]
         */
        hunt_box_radius: number,
        /**
         * how much food do we need to consume before we can cocoon
         * - Hints: 30 [0, 1]
         */
        cocoon_food_required: number,
        /**
         * if empty, won't cocoon, if set it'll spawn this after it's eaten enough
         */
        cocoon_entity: string,
        /**
         * - Hints: 50 [0, 10000]
         */
        give_up_area_radius: number,
        /**
         * - Hints: 300 [0, 10000]
         */
        give_up_time_frames: number,
        /**
         * - Hints: 0 [0, 1]
         */
        debug_follow_mouse: boolean,
        /**
         */
        mRandomTarget: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mTargetEntityId: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextTargetCheckFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mNextHuntTargetCheckFrame: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mGiveUpStarted: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mGiveUpAreaMinX: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mGiveUpAreaMinY: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mGiveUpAreaMaxX: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mGiveUpAreaMaxY: number,
    };
    WormAttractorComponent: {
        /**
         * 1 = attracts worms, -1 detracts worms
         * - Hints: 1 [-1, 1]
         */
        direction: number,
        /**
         * radius of detracting worms
         * - Hints: 50 [0, 100]
         */
        radius: number,
    };
    WormComponent: {
        /**
         * - Hints: 1 [0, 10000]
         */
        speed: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        acceleration: number,
        /**
         * - Hints: 3 [0, 10000]
         */
        gravity: number,
        /**
         * - Hints: 30 [0, 10000]
         */
        tail_gravity: number,
        /**
         * - Hints: 10 [0, 10000]
         */
        part_distance: number,
        /**
         * - Hints: 0 [0, 10000]
         */
        ground_check_offset: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        hitbox_radius: number,
        /**
         * how much damage does this do when it hits an entity
         * - Hints: 1 [0, 10]
         */
        bite_damage: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        target_kill_radius: number,
        /**
         * - Hints: 1 [0, 1e+006]
         */
        target_kill_ragdoll_force: number,
        /**
         * - Hints: 4 [0, 10000]
         */
        jump_cam_shake: number,
        /**
         * - Hints: 256 [0, 10000]
         */
        jump_cam_shake_distance: number,
        /**
         * - Hints: 0.05 [0, 10000]
         */
        eat_anim_wait_mult: number,
        /**
         */
        ragdoll_filename: string,
        /**
         * if true, tries to stay in liquids
         * - Hints: 0 [0, 1]
         */
        is_water_worm: boolean,
        /**
         * max speed, used when attracted to a point
         * - Hints: 25 [0, 1]
         */
        max_speed: number,
        /**
         */
        ground_decceleration: ComponentTypeMap['LensValue<float>'],
        /**
         */
        mTargetVec: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mGravVelocity: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mSpeed: number,
        /**
         */
        mTargetPosition: ComponentTypeMap['vec2'],
        /**
         * - Hints: 0 [0, 1]
         */
        mTargetSpeed: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mOnGroundPrev: boolean,
        /**
         * - Hints: 0 [0, 1]
         */
        mMaterialIdPrev: number,
        /**
         * - Hints: 0 [0, 1]
         */
        mFrameNextDamage: number,
        /**
         * - Hints: 1 [0, 1]
         */
        mDirectionAdjustSpeed: number,
        /**
         */
        mPrevPositions: ComponentTypeMap['WormPartPositions'],
    };
};
