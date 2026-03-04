return {
    default = setmetatable({
        ActionType = {
            Projectile = 0,
            StaticProjectile = 1,
            Modifier = 2,
            DrawMany = 3,
            Material = 4,
            Other = 5,
            Utility = 6,
            Passive = 7,
        };
    }, { __index = _G }),
}
