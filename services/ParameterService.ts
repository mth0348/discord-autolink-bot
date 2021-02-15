import { Parameter } from "../dtos/Parameter";
import { ParameterServiceConfig } from '../dtos/ParameterServiceConfig';
import { ConfigProvider } from '../helpers/ConfigProvider';
import { StringHelper } from "../helpers/StringHelper";

export class ParameterService {

    public extractParameters(text: string, configs: ParameterServiceConfig[]): Parameter[] {
        const params = text.split(" ").slice(1);

        const result: Parameter[] = [];

        params.forEach(param => {
            const paramParts = param.trim().split(":");
            if (paramParts.length === 2) {

                const paramName = paramParts[0];
                const paramValue = paramParts[1];

                // find param with that name.
                configs.forEach(config => {
                    const isNameMatch = this.isNameMatch(config, paramName);
                    const isValueAllowed = this.isValueAllowed(config, paramValue);

                    if (isNameMatch && isValueAllowed) {
                        // only add first of kind.
                        if (!result.some(r => r.name === config.parameterName)) {
                            result.push(new Parameter(config.parameterName, paramValue));
                        }

                    }
                });

            }
        });

        return result;
    }

    public tryGetParameterValue(parameterName: string, parameters: Parameter[]): string {
        let foundParameter: Parameter;
        parameters.forEach(p => {
            if (StringHelper.isEqualIgnoreCase(p.name, parameterName)) {
                foundParameter = p;
            }
        })
        return foundParameter?.value;
    }

    private isNameMatch(config: ParameterServiceConfig, paramName: string) {
        return StringHelper.isEqualIgnoreCase(config.parameterName, paramName)
            || StringHelper.isEqualIgnoreCase(config.alternativeName, paramName);
    }

    private isValueAllowed(config: ParameterServiceConfig, paramValue: string) {
        if (config.validParameterValues === null)
            return true;

        return config.validParameterValues.some(c => StringHelper.isEqualIgnoreCase(c, paramValue));
    }

}