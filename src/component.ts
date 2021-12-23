
export function Component(Config: ComponentConfig) {
    return <T extends { new(...args: any[]): {} }>(constructor: T) => {
        return class extends constructor {
            _component_config: ComponentConfig = Config;
            _component_root!: ShadowRoot;
            _component_changed!: ComponentChanged;
        }
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

interface ComponentChanged {
    (): void
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