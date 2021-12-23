import { RenderComponent } from "./core/render";

export function Module(Config: ModuleConfig) {
    return <T extends { new(...args: any[]): {} }>(constructor: T) => {
        Config.Component.forEach((component) => RenderComponent(component))

        return class extends constructor {
            _module_config: ModuleConfig = Config;
        }
    }
}

export interface ModuleConfig {
    Component: Component[]
    Bootstrap?: Component
}

interface Component extends Function { new(...args: any[]): any; }