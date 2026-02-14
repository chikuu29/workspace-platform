import { useEffect, useState } from "react"
import { useParams } from "react-router"
import ViewRenderer from "./renderer/ViewRenderer"

const WorkspacePage = () => {
    const { tenant, page } = useParams()
    const searchParams = new URLSearchParams(location.search)
    const app = searchParams.get("app")

    const [config, setConfig] = useState(null)

    useEffect(() => {
        fetch(`/api/template?tenant=${tenant}&app=${app}&page=${page}`)
            .then(res => res.json())
            .then(setConfig)
    }, [tenant, app, page])

    if (!config) return <div>Loading...</div>

    return <ViewRenderer config={config} />
}

export default WorkspacePage
