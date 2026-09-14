import type { CSSProperties } from "react"
import { GlassRim } from "@/components/glass-rim"

const v = (o: Record<string, string>) => o as CSSProperties

// The Yongdu site as Topology.png shows it: one Proxmox host running OPNsense (the site's gateway,
// IPsec to Goyang and Seokchon), Cisco CML, and the Teleport app agent the site calls "CML proxy".
// The agent dials out to the Teleport cluster on EC2 and forwards to CML, so the lab is reached
// through Teleport rather than through an exposed port.
const IN = "M378 292 V111 H300"
const OUT = "M300 111 H378 V292"

export function LabScene() {
    return (
        <div aria-hidden="true">
            <svg className="viz v-lab" viewBox="0 0 480 340">
                <GlassRim id="lab" x={0} y={0} w={480} h={340} />
                <rect className="frame draw" x="8" y="14" width="464" height="152" rx="7" pathLength={1} style={v({ "--d": "0s" })} />
                <text className="tag fade" x="20" y="33" style={v({ "--d": "0.6s" })}>Yongdu LAN, physical server</text>
                <text className="tag addr fade" x="460" y="33" textAnchor="end" style={v({ "--d": "0.6s" })}>192.168.20.0/24</text>
                <rect className="frame draw" x="18" y="42" width="444" height="114" rx="6" pathLength={1} style={v({ "--d": "0.3s" })} />
                <text className="tag fade" x="30" y="61" style={v({ "--d": "0.8s" })}>Proxmox VE</text>

                <rect className="glow fade" x="26" y="76" width="128" height="70" rx="5" style={v({ "--d": "0.6s" })} />
                <rect className="box draw fill" x="26" y="76" width="128" height="70" rx="5" pathLength={1} style={v({ "--d": "0.6s" })} />
                <text className="name fade" x="38" y="98" style={v({ "--d": "1.1s" })}>OPNsense</text>
                <text className="addr fade" x="38" y="114" style={v({ "--d": "1.15s" })}>192.168.20.1</text>
                <text className="fade" x="38" y="128" style={v({ "--d": "1.2s" })}>site gateway</text>
                <text className="fade" x="38" y="141" style={v({ "--d": "1.25s" })}>IPsec endpoint</text>
                <path className="wire draw" d="M154 111 H164" pathLength={1} style={v({ "--d": "1s" })} />
                <rect className="glow fade" x="164" y="76" width="136" height="70" rx="5" style={v({ "--d": "0.75s" })} />
                <rect className="box draw fill" x="164" y="76" width="136" height="70" rx="5" pathLength={1} style={v({ "--d": "0.75s" })} />
                <text className="name fade" x="176" y="98" style={v({ "--d": "1.3s" })}>Cisco CML</text>
                <text className="addr fade" x="176" y="114" style={v({ "--d": "1.35s" })}>192.168.20.3</text>
                <text className="fade" x="176" y="128" style={v({ "--d": "1.4s" })}>network lab</text>
                <text className="fade" x="176" y="141" style={v({ "--d": "1.45s" })}>app in Teleport</text>
                <path className="wire draw" d="M300 111 H310" pathLength={1} style={v({ "--d": "1.1s" })} />
                <rect className="glow fade" x="310" y="76" width="136" height="70" rx="5" style={v({ "--d": "0.9s" })} />
                <rect className="box draw fill" x="310" y="76" width="136" height="70" rx="5" pathLength={1} style={v({ "--d": "0.9s" })} />
                <text className="name fade" x="322" y="98" style={v({ "--d": "1.5s" })}>CML proxy</text>
                <text className="addr fade" x="322" y="114" style={v({ "--d": "1.55s" })}>192.168.20.188</text>
                <text className="fade" x="322" y="128" style={v({ "--d": "1.6s" })}>Teleport agent</text>
                <text className="fade" x="322" y="141" style={v({ "--d": "1.65s" })}>forwards to CML</text>

                <path className="wire draw" d="M90 146 V210" pathLength={1} style={v({ "--d": "1.5s" })} />
                <path className="wire draw" d="M118 146 V190 H234 V210" pathLength={1} style={v({ "--d": "1.55s" })} />
                <text className="tag fade" x="82" y="180" textAnchor="end" style={v({ "--d": "1.9s" })}>IPsec</text>
                <text className="tag fade" x="242" y="204" style={v({ "--d": "1.9s" })}>IPsec</text>
                <rect className="glow fade" x="24" y="210" width="130" height="40" rx="5" style={v({ "--d": "1.7s" })} />
                <rect className="box draw fill" x="24" y="210" width="130" height="40" rx="5" pathLength={1} style={v({ "--d": "1.7s" })} />
                <text className="name fade" x="36" y="228" style={v({ "--d": "2.1s" })}>Goyang LAN</text>
                <text className="addr fade" x="36" y="242" style={v({ "--d": "2.15s" })}>192.168.1.0/24</text>
                <rect className="glow fade" x="166" y="210" width="136" height="40" rx="5" style={v({ "--d": "1.75s" })} />
                <rect className="box draw fill" x="166" y="210" width="136" height="40" rx="5" pathLength={1} style={v({ "--d": "1.75s" })} />
                <text className="name fade" x="178" y="228" style={v({ "--d": "2.15s" })}>Seokchon LAN</text>
                <text className="addr fade" x="178" y="242" style={v({ "--d": "2.2s" })}>192.168.10.0/24</text>

                <path className="wire wg fade" d="M378 146 V210" pathLength={1} style={v({ "--d": "1.7s" })} />
                <text className="tag fade" x="386" y="182" style={v({ "--d": "2s" })}>agent tunnel</text>
                <rect className="glow fade" x="316" y="210" width="156" height="46" rx="5" style={v({ "--d": "1.8s" })} />
                <rect className="box draw fill" x="316" y="210" width="156" height="46" rx="5" pathLength={1} style={v({ "--d": "1.8s" })} />
                <text className="name fade" x="328" y="230" style={v({ "--d": "2.2s" })}>Teleport</text>
                <text className="fade" x="328" y="246" style={v({ "--d": "2.25s" })}>EC2 in the AWS VPC</text>
                <path className="wire draw" d="M378 256 V292" pathLength={1} style={v({ "--d": "2.1s" })} />
                <circle className="glow fade" cx="378" cy="300" r="8" style={v({ "--d": "2.3s" })} />
                <circle className="box draw fill" cx="378" cy="300" r="8" pathLength={1} style={v({ "--d": "2.3s" })} />
                <text className="fade" x="394" y="304" style={v({ "--d": "2.5s" })}>you</text>
                <text className="tag addr fade" x="470" y="326" textAnchor="end" style={v({ "--d": "2.5s" })}>https, cml.console.nangman.cloud</text>

                <rect className="pk" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: `path("${IN}")`, "--dur": "7s", "--d": "2.8s" })} />
                <rect className="pk hollow" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: `path("${OUT}")`, "--dur": "7s", "--d": "6.3s" })} />
                <rect className="pk hollow" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: 'path("M90 146 V210")', "--dur": "8s", "--d": "4s" })} />
                <rect className="pk hollow" x="-4" y="-1.6" width="8" height="3.2" rx="1.6" style={v({ offsetPath: 'path("M118 146 V190 H234 V210")', "--dur": "8s", "--d": "5.5s" })} />
            </svg>
        </div>
    )
}
