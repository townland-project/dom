class CInjectMap {

    private deps: Record<string, any>;
    constructor() {
        this.deps = {};
    }

    // return class instance for this key
    get(key: string) {
        const matches = this.deps[key];
        if (!matches) throw new Error("No Matches Found");
        return matches;
    }

    // store given class instance 
    set(key: string, dep: any) {
        this.deps[key] = dep;
    }
}

export const InjectMap: CInjectMap = new CInjectMap()

export function Inject(key: string) {
    return function (classInstance: any, propertyName: string) {
        let service = InjectMap.get(key)

        return classInstance[propertyName] = service
    };
}

export function Injectable(key: string): Function {
    return function (injectable: any) {
        if (typeof injectable == 'function') InjectMap.set(key, new injectable())
        else if (typeof injectable != 'function') InjectMap.set(key, injectable)
    };
}