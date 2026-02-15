// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    TAAS SHIELD ENGINE
    Enterprise Anti-Counterfeit Layer
*/

interface ICore {
    function productExists(string memory gpid) external view returns (bool);
    function getProduct(string memory gpid)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            address,
            address
        );
}

contract TaaSShield {

    address public immutable core;

    mapping(string => bool) public frozen;
    mapping(string => bool) public flagged;

    event ProductFrozen(string gpid);
    event ProductUnfrozen(string gpid);
    event ProductFlagged(string gpid, string reason);

    modifier exists(string memory gpid) {
        require(ICore(core).productExists(gpid), "PRODUCT_NOT_FOUND");
        _;
    }

    constructor(address _core) {
        require(_core != address(0), "INVALID_CORE");
        core = _core;
    }

    // =============================
    // FREEZE PRODUCT (ANTI FRAUD)
    // =============================
    function freeze(string memory gpid)
        external
        exists(gpid)
    {
        (, , , , , , , address issuer, ) = ICore(core).getProduct(gpid);
        require(msg.sender == issuer, "NOT_ISSUER");

        frozen[gpid] = true;
        emit ProductFrozen(gpid);
    }

    // =============================
    // UNFREEZE
    // =============================
    function unfreeze(string memory gpid)
        external
        exists(gpid)
    {
        (, , , , , , , address issuer, ) = ICore(core).getProduct(gpid);
        require(msg.sender == issuer, "NOT_ISSUER");

        frozen[gpid] = false;
        emit ProductUnfrozen(gpid);
    }

    // =============================
    // FLAG COUNTERFEIT
    // =============================
    function flag(string memory gpid, string memory reason)
        external
        exists(gpid)
    {
        (, , , , , , , address issuer, ) = ICore(core).getProduct(gpid);
        require(msg.sender == issuer, "NOT_ISSUER");

        flagged[gpid] = true;
        emit ProductFlagged(gpid, reason);
    }

    // =============================
    // STATUS CHECK
    // =============================
    function status(string memory gpid)
        external
        view
        returns (bool isFrozen, bool isFlagged)
    {
        return (frozen[gpid], flagged[gpid]);
    }
}