import { ClientOnly } from './client'

function formSlug() {
    const forms = [
        "accessGroups",
        "appID",
        "activityTracker",
        "cbr",
        "cis",
        "cisGlbs",
        "classicBareMetal",
        "classicSecurityGroups",
        "classicVsi",
        "classicGateways",
        "classicSshKeys",
        "classicVlans",
        "icd",
        "logs",
        "clusters",
        "dns",
        "eventStreams",
        "f5",
        "fortigate",
        "iamAccountSettings",
        "keyManagement",
        "lb",
        "nacls",
        "objectStorage",
        "observability",
        "power",
        "powerInstances",
        "powerPlacementGroups",
        "powerSharedPools",
        "powerVolumes",
        "resourceGroups",
        "sccV2",
        "secretsManager",
        "routingTables",
        "securityGroups",
        "sshKeys",
        "subnets",
        "transitGateways",
        "vpcs",
        "vpe",
        "vpn",
        "vpnServers",
        "vsi",
        "vtl"
    ];

    return forms.map((formName) => {
        return { slug: ['form', formName] }
    })
}

function v2Slug() {
    const v2Forms = [
        "projects",
        "settings",
        "services",
        "vpc",
        "vpcDeployments",
        "connectivity",
        "power",
        "classic",
        "overview",
        "stats"
    ]

    return v2Forms.map((formName) => {
        return { slug: ['v2', formName] }
    })
}

export function generateStaticParams() {

    const paths = [
        { slug: [''] },
        { slug: ['projects'] },
        { slug: ['resetState'] },
        { slug: ['docs', 'about'] },
        { slug: ['docs', 'releaseNotes'] },
        { slug: ['docs', 'json'] },
        { slug: ['docs', 'tutorial'] },
        { slug: ['summary'] },
        { slug: ['v2'] },
        { slug: ['stats'] },
    ];
    const formPaths = formSlug();
    const v2Paths = v2Slug();

    return paths.concat(formPaths).concat(v2Paths);
}

export default function Page({ params }) {
    return <ClientOnly />
}