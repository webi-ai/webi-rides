dfx canister call token export_candid | sed 's/\\n/\n/g' | gsed -z 's/",\n)//g' | gsed -z 's/(\n  "//g' | didc bind /dev/stdin --target js
