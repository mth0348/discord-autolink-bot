import { Collection } from "discord.js";
import Canvas = require("canvas");

export class ImageProvider {

    private static loadedImages: Collection<string, object> = new Collection<string, object>();

    private static registeredImageUrls: string[] = [];

    public static registerImageUrl(url: string) {
        if (this.registeredImageUrls.indexOf(url.toLowerCase()) === -1)
            this.registeredImageUrls.push(url.toLowerCase());
    }

    public static loadImageDatabase() {
        this.registeredImageUrls.forEach(async url => {
            if (!this.loadedImages.has(url.toLowerCase()) || this.loadedImages.get(url.toLowerCase()) === null) {
                this.loadedImages.set(url.toLowerCase(), await Canvas.loadImage(url.toLowerCase()));
            }
        });
    }

    public static getImage(url: string): object {
        if (this.loadedImages.has(url.toLowerCase())) {
            return this.loadedImages.get(url.toLowerCase());
        }
        throw "image for " + url + " not found.";
    }

}