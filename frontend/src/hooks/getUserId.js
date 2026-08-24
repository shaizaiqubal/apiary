const useUserId = () => {
    const apiaryUuid = localStorage.getItem('apiary_uuid')
    return apiaryUuid
}

export default useUserId