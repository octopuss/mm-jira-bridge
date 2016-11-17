import fs from 'fs-promise';
import jp from 'jsonpath';

const hooksFile = '../hooksConfig.js';

let hooks = null;

export async function findHookId(json) {
    if (!hooks) {
        hooks = JSON.parse(await fs.readFile(hooksFile));
    }
    let hook = null;
    hooks.some((hookConfig) => {
        let foundValue = jp.query(json, hookConfig.path);
        if (foundValue[0].match(hookConfig.value)) {
            hook = hookConfig.id;
            return true;
        }
    });
    return hook;
}
