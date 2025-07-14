export function idFromGid(gid: string | number) {
	return gid.toString().split("/")[4];
}
