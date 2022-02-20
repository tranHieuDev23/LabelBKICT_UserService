# Path to this plugin
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"

# Root directory of protobuf definition files
PROTOBUF_ROOT_DIR="./src/proto"

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="./src/proto/gen"

mkdir -p ${OUT_DIR}

protoc \
    --proto_path=${PROTOBUF_ROOT_DIR} \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    ./src/proto/service/userservice.proto