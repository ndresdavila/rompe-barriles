// eslint-disable-next-line no-undef
const MyToken = artifacts.require("MyToken");

module.exports = function (deployer) {
    deployer.deploy(MyToken);
};
