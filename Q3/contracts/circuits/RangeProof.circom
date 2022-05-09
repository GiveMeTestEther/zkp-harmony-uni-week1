pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component low = LessEqThan(n);
    component high = GreaterEqThan(n);

    // [assignment] insert your code here

    // in >= lower bound (range[0])
    high.in[0] <== in;
    high.in[1] <== range[0];

    // in <= upper bound (range[1])
    low[0] <== in;
    low[1] <== range[1];

    // if in range than high.out == low.out == 1, so we return 1 else one out is 0 and we get a zero
    out <== high.out * in.out; 
}