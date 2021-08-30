import config = require('../config.json');

export class ConfigProvider {
    public static current() {
        return config;
    }
}