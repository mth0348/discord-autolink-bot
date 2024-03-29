export class MtgPermanentEvent {
   public text: string;
   public score: number;
   public colorIdentity: string;
   public restrictedTypes: string[] | undefined;
   public noFollowUp: boolean | undefined;

   constructor(data: any) {
      this.text = data.text;
      this.score = data.score;
      this.colorIdentity = data.colorIdentity;
      this.restrictedTypes = data.restrictedTypes;
      this.noFollowUp = data.noFollowUp;
   }
}