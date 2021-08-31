import { MusicAuthor } from "./MusicAuthor"
import { MusicThumbnail } from './MusicThumbnail';

export class MusicTrack {

    public id: string;
    
    public title: string;

    public author: MusicAuthor;

    public description: string;

    public manacost: string;

    public duration: number;

    public isLive: boolean;

    public isUpcoming: boolean;

    public bestThumbnail: MusicThumbnail;

    public thumbnails: MusicThumbnail[];

    public views: number;

    public uploadedAt: string;

    public url: string;

    public type: string;

    public firstVideo: MusicTrack;

    public requestee: string;

    public toString(): string {
        return this.title + " from " + this.author.name;
    }
}