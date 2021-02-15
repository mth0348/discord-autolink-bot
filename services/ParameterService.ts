import { Parameter } from "../dtos/Parameter";
import { ParameterServiceConfig } from '../dtos/ParameterServiceConfig';
import { ConfigProvider } from '../helpers/ConfigProvider';

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
                    const isValueAllowed =this.isValueAllowed(config, paramValue);

                    if (isNameMatch && isValueAllowed) {
                        result.push(new Parameter(config.parameterName, paramValue));
                    }
                });

            }
        });

        return result;
    }

    private isNameMatch(config: ParameterServiceConfig, paramName: string) {
        return config.parameterName.toLowerCase() === paramName.toLowerCase()
            || config.alternativeName.toLowerCase() === paramName.toLowerCase();
    }

    private isValueAllowed(config: ParameterServiceConfig, paramValue: string) {
        if (typeof config.validParameterValues === 'boolean') 
            return true;

        return config.validParameterValues.some(c => c.toLowerCase() === paramValue.toLowerCase());
    }

}