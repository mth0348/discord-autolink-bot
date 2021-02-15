export class ParameterServiceConfig {

    public parameterName: string;
    public alternativeName: string;
    public validParameterValues: string[];

    constructor(parameterName: string, alternativeName: string, validValues: string[] = null) {
        this.parameterName = parameterName;
        this.alternativeName = alternativeName;
        this.validParameterValues = validValues;

    }
}