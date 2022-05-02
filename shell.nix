with (import <nixpkgs> {});


mkShell {
  buildInputs = [
    nixfmt
    yarn
    nodejs-14_x
  ];
}