import { RenderComponent } from "./core/render";

type Target = new (...args: any[]) => any;

export function Module(Config: ModuleConfig) {
    return (target: Target) => {
        Config.Component.forEach((component) => RenderComponent(component))

        target.prototype._module_config = Config;
    }
}

export interface ModuleConfig {
    Component: Component[]
    Bootstrap?: Component
}

type Component = Target