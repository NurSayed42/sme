import json, os
import networkx as nx

DATA_PATH = os.path.join(os.path.dirname(__file__), "../../demo-data/supply_chain.json")

def load_graph():
    with open(DATA_PATH) as f:
        data = json.load(f)
    G = nx.DiGraph()
    for c in data["companies"]:
        G.add_node(c["id"], **c)
    for e in data["edges"]:
        G.add_edge(e["source"], e["target"],
                   dependency_pct=e["dependency_pct"], label=e["label"])
    return G, data

def run_cascade(stressed_node_id: str) -> dict:
    G, raw = load_graph()
    companies = {c["id"]: c for c in raw["companies"]}
    edges = raw["edges"]
    # Base risk of the stressed node
    seed_risk = companies[stressed_node_id]["risk_score"]
    cascade_risks = {stressed_node_id: seed_risk}
    # Propagate 3 hops
    frontier = [stressed_node_id]
    for step in range(3):
        decay = 0.7 ** step
        next_frontier = []
        for node in frontier:
            for _, buyer, edata in G.out_edges(node, data=True):
                dep = edata["dependency_pct"] / 100
                propagated = cascade_risks[node] * dep * decay
                if buyer in cascade_risks:
                    cascade_risks[buyer] = min(100, cascade_risks[buyer] + propagated * 0.5)
                else:
                    cascade_risks[buyer] = propagated
                next_frontier.append(buyer)
        frontier = list(set(next_frontier))
    # Build result with risk levels
    result_companies = []
    for cid, company in companies.items():
        risk = cascade_risks.get(cid, company["risk_score"])
        if cid == stressed_node_id:
            status = "STRESSED"
            color  = "red"
        elif risk >= 60:
            status = "HIGH_RISK"
            color  = "red"
        elif risk >= 40:
            status = "WATCH"
            color  = "yellow"
        else:
            status = "NORMAL"
            color  = "green"
        result_companies.append({**company, "cascade_risk": round(risk, 1),
                                  "status": status, "color": color})
    total_exposed = sum(
        c["loan_lac"] for c in result_companies
        if c["status"] in ("HIGH_RISK","WATCH") and c["id"] != stressed_node_id
    )
    return {
        "stressed_node": stressed_node_id,
        "companies": result_companies,
        "edges": edges,
        "total_exposed_lac": total_exposed,
        "cascade_count": sum(1 for c in result_companies
                             if c["status"] in ("HIGH_RISK","WATCH")
                             and c["id"] != stressed_node_id)
    }

def get_graph_data() -> dict:
    _, raw = load_graph()
    return raw

if __name__ == "__main__":
    result = run_cascade("C1")
    print(f"Cascade from C1: {result['cascade_count']} affected, "
          f"৳{result['total_exposed_lac']}L exposed")
    for c in result["companies"]:
        print(f"  {c['name']:25s} → {c['status']:12s} risk={c['cascade_risk']}")
