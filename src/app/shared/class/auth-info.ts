export class AuthInfo {
    constructor(
        public $uid: string,
        public emailVerified = false
    ) { }

    isLoggedIn() {
        return !!this.$uid;
    }

    isEmailVerified() {
        return !!this.emailVerified;
    }
}