import { useState } from "react";

const useUserId = () => {
    const [apiaryUuid, setApiaryUuid] = useState(localStorage.getItem('apiary_uuid'))
    return apiaryUuid
}

export default useUserId