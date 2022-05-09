
const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // generates the groth16 proof and the output signals (and also the witness)
        // a and b are the two private inputs, HelloWorld.was teh compiled circuits, and circuit_final.key the prover key
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        // print out the first public signal that is the ouput signal 2 in the cas of a * b = c, where c is the output
        console.log('1x2 =',publicSignals[0]);
        // transforms the the public signal that is a string into a BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // transforms the the proof that is a string into a BigInt
        const editedProof = unstringifyBigInts(proof);

        // generates the calldata as a single string (proof and the public signal) for the verifier contract (as a single string the s.t. it can be easely copy & pasted in to remix)
        // the structure of this string can be seen in the HelloWorldVerifier.sol verifyxProof function definition:
        //  uint[2] memory a,
        //  uint[2][2] memory b,
        //  uint[2] memory c,
        //  uint[1] memory input
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // calldata is a string (such thta it can be copied & pasted in remix for convenience) 
        // it represents an array of strings (that respresent hex values with double quotes at the start/end of each element or another array), seperated by commas
        // so we need to remove [, ] and " first to have a single flat array
        // next we split this string that now has comma sperated hex values by comma and map each hex value to a BigInt in string represenation
        // this repesentation allows us to use those values as arguments for the verifyProof function (which was originally one big string)
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // we recreate a,b, c and input from the single calldata string
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        // Input is the public signal
        const Input = argv.slice(8);

        // call teh verifyProof function of the deployed veifier contract that needs to accept the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

  let Verifier;
  let verifier;

  beforeEach(async function () {
      Verifier = await ethers.getContractFactory("Multiplier3Verifier");
      verifier = await Verifier.deploy();
      await verifier.deployed();
  });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        
        // generates the gronk16 proof and the outputs signals (and also the witness)
        // a and b are the two private inputs, HelloWorld.was teh compiled circuits, and circuit_final.key the prover key
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        // print out the first public signal that is the ouput signal 2 in the cas of a * b * c = d, where d is the output
        console.log('1x2x3 =',publicSignals[0]);

        // transforms the the public signal that is a string into a BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // transforms the the proof that is a string into a BigInt
        const editedProof = unstringifyBigInts(proof);

        // generates the calldata as a single string (proof and the public signal) for the verifier contract (as a single string the s.t. it can be easely copy & pasted in to remix)
        // the structure of this string can be seen in the Multiplier3Verifier.sol verifyxProof function definition:
        //  uint[2] memory a,
        //  uint[2][2] memory b,
        //  uint[2] memory c,
        //  uint[1] memory input
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // calldata is a string (such thta it can be copied & pasted in remix for convenience) 
        // it represents an array of strings (that respresent hex values with double quotes at the start/end of each element or another array), seperated by commas
        // so we need to remove [, ] and " first to have a single flat array
        // next we split this string that now has comma sperated hex values by comma and map each hex value to a BigInt in string represenation
        // this repesentation allows us to use those values as arguments for the verifyProof function (which was originally one big string)
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // we recreate a,b, c and input from the single calldata string
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        // Input is the public signal
        const Input = argv.slice(8);

        // call the verifyProof function of the deployed verifier contract that needs to accept the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;

    });
});


describe("Multiplier3 with PLONK", function () {

  let Verifier;
  let verifier;

  beforeEach(async function () {
      Verifier = await ethers.getContractFactory("PlonkVerifier");
      verifier = await Verifier.deploy();
      await verifier.deployed();
  });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        
        // generates the plonk proof and the outputs signals (and also the witness)
        // a and b are the two private inputs, HelloWorld.wasm the compiled circuits, and circuit_final.key the prover key
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");
        // print out the first public signal that is the ouput signal 2 in the cas of a * b * c = d, where d is the output
        console.log('1x2x3 =',publicSignals[0]);

        // transforms the the public signal that is a string into a BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // transforms the the proof that is a string into a BigInt
        const editedProof = unstringifyBigInts(proof);

        // generates the calldata as a single string (proof and the public signal) for the verifier contract (as a single string the s.t. it can be easely copy & pasted in to remix)
        // the structure of this string can be seen in the _plonkMultiplier3Verifier.sol verifyxProof function definition:
        //  verifyProof(bytes memory proof, uint[] memory pubSignals)
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',');

        const proof_ = argv[0];
        const pubSignals = [BigInt(argv[1]).toString()];
        // call the verifyProof function of the deployed verifier contract
        expect(await verifier.verifyProof(proof_, pubSignals)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        expect(await verifier.verifyProof(0x0,['0'])).to.be.false;
    });
});
