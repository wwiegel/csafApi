const csaf_to_graphql_query= {
    kind: "SelectionSet",
    selections: [
        {kind: "Field", name: {kind: "Name", value: "document"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "acknowledgments"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "names"}},
                        {kind: "Field", name: {kind: "Name", value: "organization"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}},
                        {kind: "Field", name: {kind: "Name", value: "urls"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "aggregate_severity"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "namespace"}},
                        {kind: "Field", name: {kind: "Name", value: "text"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "category"}},
                {kind: "Field", name: {kind: "Name", value: "csaf_version"}},
                {kind: "Field", name: {kind: "Name", value: "distribution"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "text"}},
                        {kind: "Field", name: {kind: "Name", value: "tlp"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "label"}},
                                {kind: "Field", name: {kind: "Name", value: "url"}}
                            ]}
                        }
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "lang"}},
                {kind: "Field", name: {kind: "Name", value: "notes"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "audience"}},
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "text"}},
                        {kind: "Field", name: {kind: "Name", value: "title"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "publisher"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "contact_details"}},
                        {kind: "Field", name: {kind: "Name", value: "issuing_authority"}},
                        {kind: "Field", name: {kind: "Name", value: "name"}},
                        {kind: "Field", name: {kind: "Name", value: "namespace"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "references"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}},
                        {kind: "Field", name: {kind: "Name", value: "url"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "source_lang"}},
                {kind: "Field", name: {kind: "Name", value: "title"}},
                {kind: "Field", name: {kind: "Name", value: "tracking"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "aliases"}},
                        {kind: "Field", name: {kind: "Name", value: "current_release_date"}},
                        {kind: "Field", name: {kind: "Name", value: "generator"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "date"}},
                                {kind: "Field", name: {kind: "Name", value: "engine"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "name"}},
                                        {kind: "Field", name: {kind: "Name", value: "version"}}
                                    ]}
                                }
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "id"}},
                        {kind: "Field", name: {kind: "Name", value: "initial_release_date"}},
                        {kind: "Field", name: {kind: "Name", value: "revision_history"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "date"}},
                                {kind: "Field", name: {kind: "Name", value: "legacy_version"}},
                                {kind: "Field", name: {kind: "Name", value: "number"}},
                                {kind: "Field", name: {kind: "Name", value: "summary"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "status"}},
                        {kind: "Field", name: {kind: "Name", value: "version"}}
                    ]}
                }
            ]}
        },
        {kind: "Field", name: {kind: "Name", value: "product_tree"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "branches"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "branches"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "branches"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "branches"}},
                                        {kind: "Field", name: {kind: "Name", value: "category"}},
                                        {kind: "Field", name: {kind: "Name", value: "name"}},
                                        {kind: "Field", name: {kind: "Name", value: "product"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "name"}},
                                                {kind: "Field", name: {kind: "Name", value: "product_id"}},
                                                {kind: "Field", name: {kind: "Name", value: "product_identification_helper"},
                                                    selectionSet: {kind: "SelectionSet", selections: [
                                                        {kind: "Field", name: {kind: "Name", value: "cpe"}},
                                                        {kind: "Field", name: {kind: "Name", value: "hashes"},
                                                            selectionSet: {kind: "SelectionSet", selections: [
                                                                {kind: "Field", name: {kind: "Name", value: "file_hashes"},
                                                                    selectionSet: {kind: "SelectionSet", selections: [
                                                                        {kind: "Field", name: {kind: "Name", value: "algorithm"}},
                                                                        {kind: "Field", name: {kind: "Name", value: "value"}}
                                                                    ]}
                                                                },
                                                                {kind: "Field", name: {kind: "Name", value: "filename"}}
                                                            ]}
                                                        },
                                                        {kind: "Field", name: {kind: "Name", value: "model_numbers"}},
                                                        {kind: "Field", name: {kind: "Name", value: "purl"}},
                                                        {kind: "Field", name: {kind: "Name", value: "sbom_urls"}},
                                                        {kind: "Field", name: {kind: "Name", value: "serial_numbers"}},
                                                        {kind: "Field", name: {kind: "Name", value: "skus"}},
                                                        {kind: "Field", name: {kind: "Name", value: "x_generic_uris"}}
                                                    ]}
                                                }
                                            ]}
                                        }
                                    ]}
                                },
                                {kind: "Field", name: {kind: "Name", value: "category"}},
                                {kind: "Field", name: {kind: "Name", value: "name"}},
                                {kind: "Field", name: {kind: "Name", value: "product"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "name"}},
                                        {kind: "Field", name: {kind: "Name", value: "product_id"}},
                                        {kind: "Field", name: {kind: "Name", value: "product_identification_helper"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "cpe"}},
                                                {kind: "Field", name: {kind: "Name", value: "hashes"},
                                                    selectionSet: {kind: "SelectionSet", selections: [
                                                        {kind: "Field", name: {kind: "Name", value: "file_hashes"},
                                                            selectionSet: {kind: "SelectionSet", selections: [
                                                                {kind: "Field", name: {kind: "Name", value: "algorithm"}},
                                                                {kind: "Field", name: {kind: "Name", value: "value"}}
                                                            ]}
                                                        },
                                                        {kind: "Field", name: {kind: "Name", value: "filename"}}
                                                    ]}
                                                },
                                                {kind: "Field", name: {kind: "Name", value: "model_numbers"}},
                                                {kind: "Field", name: {kind: "Name", value: "purl"}},
                                                {kind: "Field", name: {kind: "Name", value: "sbom_urls"}},
                                                {kind: "Field", name: {kind: "Name", value: "serial_numbers"}},
                                                {kind: "Field", name: {kind: "Name", value: "skus"}},
                                                {kind: "Field", name: {kind: "Name", value: "x_generic_uris"}}
                                            ]}
                                        }
                                    ]}
                                }
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "name"}},
                        {kind: "Field", name: {kind: "Name", value: "product"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "name"}},
                                {kind: "Field", name: {kind: "Name", value: "product_id"}},
                                {kind: "Field", name: {kind: "Name", value: "product_identification_helper"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "cpe"}},
                                        {kind: "Field", name: {kind: "Name", value: "hashes"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "file_hashes"},
                                                    selectionSet: {kind: "SelectionSet", selections: [
                                                        {kind: "Field", name: {kind: "Name", value: "algorithm"}},
                                                        {kind: "Field", name: {kind: "Name", value: "value"}}
                                                    ]}
                                                },
                                                {kind: "Field", name: {kind: "Name", value: "filename"}}
                                            ]}
                                        },
                                        {kind: "Field", name: {kind: "Name", value: "model_numbers"}},
                                        {kind: "Field", name: {kind: "Name", value: "purl"}},
                                        {kind: "Field", name: {kind: "Name", value: "sbom_urls"}},
                                        {kind: "Field", name: {kind: "Name", value: "serial_numbers"}},
                                        {kind: "Field", name: {kind: "Name", value: "skus"}},
                                        {kind: "Field", name: {kind: "Name", value: "x_generic_uris"}}
                                    ]}
                                }
                            ]}
                        }
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "full_product_names"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "name"}},
                        {kind: "Field", name: {kind: "Name", value: "product_id"}},
                        {kind: "Field", name: {kind: "Name", value: "product_identification_helper"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "cpe"}},
                                {kind: "Field", name: {kind: "Name", value: "hashes"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "file_hashes"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "algorithm"}},
                                                {kind: "Field", name: {kind: "Name", value: "value"}}
                                            ]}
                                        },
                                        {kind: "Field", name: {kind: "Name", value: "filename"}}
                                    ]}
                                },
                                {kind: "Field", name: {kind: "Name", value: "model_numbers"}},
                                {kind: "Field", name: {kind: "Name", value: "purl"}},
                                {kind: "Field", name: {kind: "Name", value: "sbom_urls"}},
                                {kind: "Field", name: {kind: "Name", value: "serial_numbers"}},
                                {kind: "Field", name: {kind: "Name", value: "skus"}},
                                {kind: "Field", name: {kind: "Name", value: "x_generic_uris"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "namespace"}},
                                        {kind: "Field", name: {kind: "Name", value: "uri"}}
                                    ]}
                                }
                            ]}
                        }
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "product_groups"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "group_id"}},
                        {kind: "Field", name: {kind: "Name", value: "product_ids"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "relationships"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "full_product_name"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "name"}},
                                {kind: "Field", name: {kind: "Name", value: "product_id"}},
                                {kind: "Field", name: {kind: "Name", value: "product_identification_helper"},
                                    selectionSet: {kind: "SelectionSet", selections: [
                                        {kind: "Field", name: {kind: "Name", value: "cpe"}},
                                        {kind: "Field", name: {kind: "Name", value: "hashes"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "file_hashes"},
                                                    selectionSet: {kind: "SelectionSet", selections: [
                                                        {kind: "Field", name: {kind: "Name", value: "algorithm"}},
                                                        {kind: "Field", name: {kind: "Name", value: "value"}}
                                                    ]}
                                                },
                                                {kind: "Field", name: {kind: "Name", value: "filename"}}
                                            ]}
                                        },
                                        {kind: "Field", name: {kind: "Name", value: "model_numbers"}},
                                        {kind: "Field", name: {kind: "Name", value: "purl"}},
                                        {kind: "Field", name: {kind: "Name", value: "sbom_urls"}},
                                        {kind: "Field", name: {kind: "Name", value: "serial_numbers"}},
                                        {kind: "Field", name: {kind: "Name", value: "skus"}},
                                        {kind: "Field", name: {kind: "Name", value: "x_generic_uris"},
                                            selectionSet: {kind: "SelectionSet", selections: [
                                                {kind: "Field", name: {kind: "Name", value: "namespace"}},
                                                {kind: "Field", name: {kind: "Name", value: "uri"}}
                                            ]}
                                        }
                                    ]}
                                }
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "product_reference"}},
                        {kind: "Field", name: {kind: "Name", value: "relates_to_product_reference"}}
                    ]}
                }
            ]}
        },
        {kind: "Field", name: {kind: "Name", value: "vulnerabilities"},
            selectionSet: {kind: "SelectionSet", selections: [
                {kind: "Field", name: {kind: "Name", value: "acknowledgments"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "names"}},
                        {kind: "Field", name: {kind: "Name", value: "organization"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}},
                        {kind: "Field", name: {kind: "Name", value: "urls"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "cve"}},
                {kind: "Field", name: {kind: "Name", value: "cwe"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "id"}},
                        {kind: "Field", name: {kind: "Name", value: "name"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "discovery_date"}},
                {kind: "Field", name: {kind: "Name", value: "flags"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "date"}},
                        {kind: "Field", name: {kind: "Name", value: "group_ids"}},
                        {kind: "Field", name: {kind: "Name", value: "label"}},
                        {kind: "Field", name: {kind: "Name", value: "product_ids"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "ids"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "system_name"}},
                        {kind: "Field", name: {kind: "Name", value: "text"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "involvements"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "date"}},
                        {kind: "Field", name: {kind: "Name", value: "party"}},
                        {kind: "Field", name: {kind: "Name", value: "status"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "notes"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "audience"}},
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "text"}},
                        {kind: "Field", name: {kind: "Name", value: "title"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "product_status"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "first_affected"}},
                        {kind: "Field", name: {kind: "Name", value: "first_fixed"}},
                        {kind: "Field", name: {kind: "Name", value: "fixed"}},
                        {kind: "Field", name: {kind: "Name", value: "known_affected"}},
                        {kind: "Field", name: {kind: "Name", value: "known_not_affected"}},
                        {kind: "Field", name: {kind: "Name", value: "last_affected"}},
                        {kind: "Field", name: {kind: "Name", value: "recommended"}},
                        {kind: "Field", name: {kind: "Name", value: "under_investigation"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "references"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "summary"}},
                        {kind: "Field", name: {kind: "Name", value: "url"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "release_date"}},
                {kind: "Field", name: {kind: "Name", value: "remediations"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "date"}},
                        {kind: "Field", name: {kind: "Name", value: "details"}},
                        {kind: "Field", name: {kind: "Name", value: "entitlements"}},
                        {kind: "Field", name: {kind: "Name", value: "group_ids"}},
                        {kind: "Field", name: {kind: "Name", value: "product_ids"}},
                        {kind: "Field", name: {kind: "Name", value: "restart_required"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "category"}},
                                {kind: "Field", name: {kind: "Name", value: "details"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "url"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "scores"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "cvss_v2"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "version"}},
                                {kind: "Field", name: {kind: "Name", value: "vectorString"}},
                                {kind: "Field", name: {kind: "Name", value: "accessVector"}},
                                {kind: "Field", name: {kind: "Name", value: "accessComplexity"}},
                                {kind: "Field", name: {kind: "Name", value: "authentication"}},
                                {kind: "Field", name: {kind: "Name", value: "confidentialityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "integrityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "availabilityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "baseScore"}},
                                {kind: "Field", name: {kind: "Name", value: "exploitability"}},
                                {kind: "Field", name: {kind: "Name", value: "remediationLevel"}},
                                {kind: "Field", name: {kind: "Name", value: "reportConfidence"}},
                                {kind: "Field", name: {kind: "Name", value: "temporalScore"}},
                                {kind: "Field", name: {kind: "Name", value: "collateralDamagePotential"}},
                                {kind: "Field", name: {kind: "Name", value: "targetDistribution"}},
                                {kind: "Field", name: {kind: "Name", value: "confidentialityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "integrityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "availabilityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "environmentalScore"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "cvss_v3"},
                            selectionSet: {kind: "SelectionSet", selections: [
                                {kind: "Field", name: {kind: "Name", value: "version"}},
                                {kind: "Field", name: {kind: "Name", value: "vectorString"}},
                                {kind: "Field", name: {kind: "Name", value: "attackVector"}},
                                {kind: "Field", name: {kind: "Name", value: "attackComplexity"}},
                                {kind: "Field", name: {kind: "Name", value: "privilegesRequired"}},
                                {kind: "Field", name: {kind: "Name", value: "userInteraction"}},
                                {kind: "Field", name: {kind: "Name", value: "scope"}},
                                {kind: "Field", name: {kind: "Name", value: "confidentialityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "integrityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "availabilityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "baseScore"}},
                                {kind: "Field", name: {kind: "Name", value: "baseSeverity"}},
                                {kind: "Field", name: {kind: "Name", value: "exploitCodeMaturity"}},
                                {kind: "Field", name: {kind: "Name", value: "remediationLevel"}},
                                {kind: "Field", name: {kind: "Name", value: "reportConfidence"}},
                                {kind: "Field", name: {kind: "Name", value: "temporalScore"}},
                                {kind: "Field", name: {kind: "Name", value: "temporalSeverity"}},
                                {kind: "Field", name: {kind: "Name", value: "confidentialityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "integrityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "availabilityRequirement"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedAttackVector"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedAttackComplexity"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedPrivilegesRequired"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedUserInteraction"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedScope"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedConfidentialityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedIntegrityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "modifiedAvailabilityImpact"}},
                                {kind: "Field", name: {kind: "Name", value: "environmentalScore"}},
                                {kind: "Field", name: {kind: "Name", value: "environmentalSeverity"}}
                            ]}
                        },
                        {kind: "Field", name: {kind: "Name", value: "products"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "threats"},
                    selectionSet: {kind: "SelectionSet", selections: [
                        {kind: "Field", name: {kind: "Name", value: "category"}},
                        {kind: "Field", name: {kind: "Name", value: "date"}},
                        {kind: "Field", name: {kind: "Name", value: "details"}},
                        {kind: "Field", name: {kind: "Name", value: "group_ids"}},
                        {kind: "Field", name: {kind: "Name", value: "product_ids"}}
                    ]}
                },
                {kind: "Field", name: {kind: "Name", value: "title"}}
            ]}
        }
    ]
};

module.exports = csaf_to_graphql_query;