export class MtgPermanentCondition {
   public text: string;
   public replacementText: string;
   public context: string;

   constructor(data: any) {
      this.text = data.text;
      this.replacementText = data.replacementText;
      this.context = data.context;
  }
}