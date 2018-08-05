export class Upload {
    public uid: string;
    public file: File;
    public url: string;
    public fullPath: string;
    public name: string;
    public timeStamp: any;
    public progress: number;
    public size: number;
    public type: string;
    constructor(file: File) {
        this.file = file;
    }
}
