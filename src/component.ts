type Target = new (...args: any[]) => any;

export function Component(Config: ComponentConfig) {
    return (target: Target) => {
        target.prototype._component_config = Config;
        target.prototype._component_attr = {}
        /*
            Helper prototype methods

            target.prototype._component_root = undefined; // rendered template
            target.prototype._component_changed = () => { }; // function to rebind value
        */
    }
}

export class ComponentHelper {
    get Element(): HTMLElement {
        return (this as any)._component_root
    }

    get Attributes(): Attribute {
        return (this as any)._component_attr
    }

    ValueChanged() {
        (this as any)._component_changed()
    }
}

export interface ComponentOnInit {
    ComponentOnInit(): void | Promise<void>
}

export interface RenderOnInit {
    RenderOnInit(): void | Promise<void>
}

export interface RenderOnDestroy {
    RenderOnDestroy(): void | Promise<void>
}

export interface ComponentConfig {
    id: string
    template?: string
    templateUrl?: string
    style?: string
    styleUrl?: string
    attr?: Attribute
}

export interface IComponent {
    _component_id: string
    _component_config: ComponentConfig
    _component_attr: Attribute
    _component_root: HTMLElement
    _component_changed: ComponentChangedFunc
}

export interface IComponentPrototype {
    ComponentOnInit?: ComponentOnInit
    RenderOnInit?: RenderOnInit
    RenderOnDestroy?: RenderOnDestroy
}

interface Attribute {
    [key: string]: any
}

interface ComponentChangedFunc {
    (): void
}