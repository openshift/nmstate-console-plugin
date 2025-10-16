NMSTATE_RELEASE=v0.84.0

mkdir -p crds

curl https://raw.githubusercontent.com/nmstate/kubernetes-nmstate/${NMSTATE_RELEASE}/deploy/crds/nmstate.io_nmstates.yaml -o ./crds/nmstate.io_nmstates.yaml
curl https://raw.githubusercontent.com/nmstate/kubernetes-nmstate/${NMSTATE_RELEASE}/deploy/crds/nmstate.io_nodenetworkconfigurationpolicies.yaml -o ./crds/nmstate.io_nodenetworkconfigurationpolicies.yaml
curl https://raw.githubusercontent.com/nmstate/kubernetes-nmstate/${NMSTATE_RELEASE}/deploy/crds/nmstate.io_nodenetworkconfigurationenactments.yaml -o ./crds/nmstate.io_nodenetworkconfigurationenactments.yaml
curl https://raw.githubusercontent.com/nmstate/kubernetes-nmstate/${NMSTATE_RELEASE}/deploy/crds/nmstate.io_nodenetworkstates.yaml -o ./crds/nmstate.io_nodenetworkstates.yaml
