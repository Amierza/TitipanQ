const PackageInfoComponent = ({ title, information }:
    { title: string, information: string }) => {
    return (
        <div className="space-y-2">
            <h3 className="text-base font-bold">{title}</h3>
            <p>{information}</p>
        </div>
    )
}

export default PackageInfoComponent