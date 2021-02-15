import { Collection } from "discord.js";
import Canvas = require("canvas");

export class ImageProvider {

    private static loadedImages: Collection<string, object> = new Collection<string, object>();

    private static registeredImageUrls: string[] = [];

    public static registerImageUrl(url: string) {
        if (this.registeredImageUrls.indexOf(url) === -1)
            this.registeredImageUrls.push(url);
    }

    public static loadImageDatabase() {
        this.registeredImageUrls.forEach(async url => {
            if (!this.loadedImages.has(url) || this.loadedImages.get(url) === null) {
                this.loadedImages.set(url, await Canvas.loadImage(url));
            }
        });
    }

    public static getImage(url: string): object {
        if (this.loadedImages.has(url)) {
            return this.loadedImages.get(url);
        }
        throw "image for " + url + " not found.";
    }

}