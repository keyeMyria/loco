export function parseSolrResponse(data) {
	if(data && data.response && data.response.docs) {
		return data.response.docs
	}
}