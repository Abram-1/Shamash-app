
# SHAMASH — Inspection Protocol Response System

## Purpose
Process an inspection / snag / unfinished-work protocol and prepare a traceable response for every finding.

## Response pipeline
1. Import protocol: PDF, Word, Excel, email, message, or manual entry.
2. Split into individual findings.
3. Extract the inspector's exact statement and any cited law, regulation, standard, specification, drawing or clause.
4. Identify the affected project/object/area and work package.
5. Build the applicable requirement set.
6. Verify each cited source and its current effective version.
7. Compare the finding with:
   - approved drawings and revisions;
   - permit conditions;
   - contract and technical specification;
   - applicable planning/building regulations;
   - official/mandatory Israeli standards;
   - manufacturer's instructions when relevant;
   - accepted test/laboratory evidence.
8. Classify the response:
   - accepted — correction required;
   - accepted with clarification;
   - partially accepted;
   - disputed — factual/technical/legal basis required;
   - not applicable;
   - evidence insufficient — expert/site verification required.
9. Produce a draft answer with source references and evidence links.
10. Human review/approval.
11. Send final response and record the result back into Project Memory.

## Source hierarchy
SHAMASH must not assume that every Israeli Standard is automatically binding. The system records why a source applies: legislation/regulation, officially mandatory standard, contractual incorporation, permit/specification requirement, drawing requirement, or other documented basis. The Ministry's official standards service distinguishes official standards and warns that law prevails where there is a conflict. 

For building design/construction requirements, SHAMASH should use the current Planning and Building Law and applicable Building Code / regulations, including the official planning authority material. The current Building Code material explains that regulations are statutory and that where newer regulations have not yet replaced older provisions, the relevant Second Schedule provisions may still be referenced.

## Evidence rule
A response should be evidence-first. A finding is not considered closed merely because a written answer exists. Closure requires one or more of:
- corrected-work photo;
- measurement/test;
- approved drawing detail;
- delivery/material certificate;
- laboratory report;
- protocol/inspection record;
- responsible professional approval.

## Versioning rule
Every legal/normative citation stores:
- source type;
- title;
- identifier/number;
- clause/section;
- edition/version;
- publication/effective date if known;
- retrieval date;
- source URL or document reference;
- applicability reason.

If the system cannot verify the current text or applicability, it must mark the item **"requires legal/technical verification"** instead of inventing a conclusion.

## Output
The final protocol response should be bilingual-ready (Hebrew/Russian), preserve the inspector's original wording, clearly distinguish:
- inspector allegation;
- verified requirement;
- SHAMASH factual analysis;
- proposed contractor response;
- required corrective action;
- evidence;
- responsible person;
- target date;
- closure verification.
