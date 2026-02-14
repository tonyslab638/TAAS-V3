// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    TAAS V3 — PRODUCT CORE CONTRACT
    --------------------------------
    Features:
    ✔ Create product
    ✔ Immutable product data
    ✔ Ownership tracking
    ✔ Public verification
    ✔ Gas optimized
*/

contract TaaSProductCore {

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address issuer;
        address owner;
    }

    mapping(string => Product) private products;
    mapping(string => bool) private exists;

    event ProductCreated(
        string gpid,
        address indexed issuer,
        address indexed owner,
        uint256 timestamp
    );

    event OwnershipTransferred(
        string gpid,
        address indexed from,
        address indexed to
    );

    modifier onlyOwner(string memory gpid) {
        require(products[gpid].owner == msg.sender, "NOT_OWNER");
        _;
    }

    modifier productExists(string memory gpid) {
        require(exists[gpid], "PRODUCT_NOT_FOUND");
        _;
    }

    // =========================
    // CREATE PRODUCT
    // =========================
    function createProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch
    ) external {

        require(bytes(gpid).length > 0, "INVALID_GPID");
        require(!exists[gpid], "GPID_EXISTS");

        products[gpid] = Product({
            gpid: gpid,
            brand: brand,
            model: model,
            category: category,
            factory: factory,
            batch: batch,
            bornAt: block.timestamp,
            issuer: msg.sender,
            owner: msg.sender
        });

        exists[gpid] = true;

        emit ProductCreated(
            gpid,
            msg.sender,
            msg.sender,
            block.timestamp
        );
    }

    // =========================
    // TRANSFER OWNERSHIP
    // =========================
    function transferOwnership(
        string memory gpid,
        address newOwner
    )
        external
        productExists(gpid)
        onlyOwner(gpid)
    {
        require(newOwner != address(0), "INVALID_OWNER");

        address oldOwner = products[gpid].owner;
        products[gpid].owner = newOwner;

        emit OwnershipTransferred(gpid, oldOwner, newOwner);
    }

    // =========================
    // VERIFY PRODUCT
    // =========================
    function getProduct(string memory gpid)
        external
        view
        productExists(gpid)
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
        )
    {
        Product memory p = products[gpid];

        return (
            p.gpid,
            p.brand,
            p.model,
            p.category,
            p.factory,
            p.batch,
            p.bornAt,
            p.issuer,
            p.owner
        );
    }

    // =========================
    // QUICK CHECK
    // =========================
    function existsProduct(string memory gpid)
        external
        view
        returns (bool)
    {
        return exists[gpid];
    }
}