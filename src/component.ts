type Target = new (...args: any[]) => any;

export function Component(Config: ComponentConfig) {
    return (target: Target) => {
        target.prototype._component_config = Config;
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

    ValueChanged() {
        (this as any)._component_changed()
    }
}

export interface ComponentConfig {
    id: string
    template?: string
    templateUrl?: string
    style?: string
    styleUrl?: string
    attr?: Attr
}

interface Attr {
    [key: string]: any
}

export interface ComponentOnInit {
    ComponentOnInit(): void
}

export interface RenderOnInit {
    RenderOnInit(): void
}

export interface RenderOnDestroy {
    RenderOnDestroy(): void
}