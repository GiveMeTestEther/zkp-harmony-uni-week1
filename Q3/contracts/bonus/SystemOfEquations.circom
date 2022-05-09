pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    // intermediate signal
    signal zeroCheck[n];

    // A * x
    component A_times_b = matMul(n,n,1);
    for(var i = 0; i < n; i++){
      A_times_b.b[i][0] <== x[i]; // set x
      for(var j = 0; j < n; j++){
          A_times_b.a[i][j] <== A[i][j]; // set A
      }
    }

    // check  A * x == b for each row
    component checkZero[n];
    for(var i = 0; i < n; i++){
      checkZero[i] = IsEqual();
      checkZero[i].in[0] <== A_times_b.out[i][0];
      checkZero[i].in[1] <== b[i];
      zeroCheck[i] <== checkZero[i].out;
    }

    // zeroCheck[n] has only values 0 and 1
    // sum up the values zeroCheck[n]
    component sumZeroCheck = matElemSum(n,1);
    for(var i = 0; i < n; i++){
      sumZeroCheck.a[i][0] <== zeroCheck[i];
    }
    
    // check if the sum of zeroCheck[n] is zero
    component checkSumIsZero = IsZero();
    checkSumIsZero.in <== sumZeroCheck.out;

    out <== checkSumIsZero.out;

}

component main {public [A, b]} = SystemOfEquations(3);