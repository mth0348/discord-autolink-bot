export class MtgPermanentCondition {
   public text: string;
   public replacementText: string;
   public context: string;
   public restrictedTypes: string[] | undefined;

   constructor(data: any) {
      this.text = data.text;
      this.replacementText = data.replacementText;
      this.context = data.context;
      this.restrictedTypes = data.restrictedTypes;
   }
}