export function Bind(name: string) {
    return function (target: any, key: string) {
        try {
            let _prev = Object.getOwnPropertyDescriptor(target, key);
            let _value: any = target[key]

            const descriptor = {
                get(this: any) {
                    try {
                        if (_prev) _prev.get!()
                        return _value
                    } finally { }
                },
                set: function (this: any, value: any) {
                    try {
                        if (this._component_root)
                            this._component_root!.querySelector(`[bind-value="${name}"]`)!.innerHTML = value

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