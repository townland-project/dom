export function Attribute(name: string) {
    return function (target: any, key: string) {
        try {
            let _prev = Object.getOwnPropertyDescriptor(target, key);
            let _value: any = target[key]

            const descriptor = {
                get(this: any) {
                    try {
                        if (_prev) _prev.get!()
                        else if (this._component_attr[name])
                            _value = this._component_attr[name]

                        return _value
                    } finally { }
                },
                set: (value: any) => {
                    try {
                        if (_prev) _prev.set!(value);
                        _value = value
                    } finally { }
                },
                enumerable: _prev == null ? true : _prev.enumerable,
                configurable: _prev == null ? true : _prev.configurable
            };

            Object.defineProperty(target, name, descriptor);
        } finally {
        }
    }
}

export interface AttributeOnChange {
    AttributeOnChange(): void | Promise<void>
}