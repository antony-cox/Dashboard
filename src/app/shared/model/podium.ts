import { podiumDetail } from "./podiumDetail";

export class Podium {
    yellow: podiumDetail;
    green: podiumDetail;
    white: podiumDetail;
    polka: podiumDetail;

    constructor()
    {
        this.yellow = new podiumDetail();
        this.green = new podiumDetail();
        this.white = new podiumDetail();
        this.polka = new podiumDetail();
    }
}