export class UserInfoOpen {
    constructor(
        public alias: string,
        public fName: string,
        public lName: string,
        public zipCode: string,
        public uid?: string,
        public bio?: string,
        public city?: string,
        public state?: string,
        public imageUrl?: string
    ) { }

    displayName() {
        return this.alias ? this.alias : this.fName;
    }

    // returns true if uid contains a truthy value (is neither null nor an empty string)
    exists() {
        return !!(this.uid);
    }
}
