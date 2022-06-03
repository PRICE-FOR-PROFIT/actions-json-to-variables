const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

try {
    const jsonString = core.getInput('json-string', { required: true });
    const prefix = core.getInput('prefix') || 'json';
    const masked = (core.getInput('masked') || 'false') === 'true';

    const rootObj = JSON.parse(jsonString);

    const processVariable = (variable, name) => {

        if (typeof variable === 'undefined' || variable === null) {
            return;
        }

        if (Array.isArray(variable)) {
            variable.forEach((value, index) => {
                processVariable(value, `${name}_${index}`);
            });
        }
        else if (typeof variable === 'object') {
            for (const field in variable) {
                processVariable(variable[field], `${name}_${field}`);
            }
        }
        else {
            if (masked) {
                core.setSecret(variable);
            }

            core.info(`SET ENV '${name}' = ${variable}`);
            core.exportVariable(name, variable.toString());
        }
    };

    processVariable(rootObj, prefix);

} catch (error) {
    core.setFailed(error.message);
}
