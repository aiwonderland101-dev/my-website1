module.exports = function (jsModule) {
    switch (jsModule) {
        case 'drivelist': return require('/workspaces/my_website/WonderSpace/theia-app/node_modules/drivelist/build/Release/drivelist.node');
    }
    throw new Error(`unhandled module: "${jsModule}"`);
}