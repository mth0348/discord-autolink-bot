export class ParameterServiceConfig {

    public parameterName: string;
    public alternativeName: string;
    public validParameterValues: string[] | boolean;

    constructor(parameterName: string, alternativeName: string, validValues: string[]) {
        this.parameterName = parameterName;
        this.alternativeName = alternativeName;
        this.validParameterValues = validValues;

    }
}