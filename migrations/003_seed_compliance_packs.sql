-- Seed compliance packs for NSW, QLD, SA, TAS, VIC with specific configs
DO $$
DECLARE
    nsw_pack_id uuid := gen_random_uuid();
    qld_pack_id uuid := gen_random_uuid();
    sa_pack_id uuid := gen_random_uuid();
    tas_pack_id uuid := gen_random_uuid();
    vic_pack_id uuid := gen_random_uuid();
    org_id uuid;
BEGIN
    -- Ensure we have an organization_id
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found for seeding compliance packs';
    END IF;

    -- NSW Q6
    INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, status, classification, idempotency_key, content)
    VALUES (nsw_pack_id, nsw_pack_id, 1, true, 'compliance_pack', 'compliance_pack', 'NSW Q6 Compliance Pack (2024.02)', org_id, 'approved', 'internal', 'seed:pack:NSW_Q6_2024_02',
        jsonb_build_object(
            'jurisdiction', 'NSW',
            'agency', 'TfNSW',
            'version', '2024.02',
            'required_registers', jsonb_build_array('work_lot_register','hold_witness_register','itp_register','identified_records_register'),
            'itp_requirements', jsonb_build_object('endorsement_required', true, 'endorsement_roles', jsonb_build_array('Designer','Engineer')),
            'hold_points_spec', jsonb_build_array('As per spec tables'),
            'witness_points_spec', jsonb_build_array('As per spec tables'),
            'milestones_spec', jsonb_build_array('Pre-opening validation'),
            'records_identified', jsonb_build_array('Quality Management Records','Testing and Commissioning Reports'),
            'test_frequency_rules', jsonb_build_array('Annex L sampling for areal outputs'),
            'special_workflows', jsonb_build_array('Primary Testing', 'Annex L sampling'),
            'ui_modules', jsonb_build_array('quality_module'),
            'feature_flags_default', jsonb_build_object('quality_module', true, 'enable_primary_testing', true, 'enable_annexL_sampling', true),
            'rules', jsonb_build_object(
                'validators', jsonb_build_array('characteristic_values_calc','lab_accreditation_required','annex_l_sampling'),
                'db_invariants', jsonb_build_array('gate_itp_endorsement','gate_lot_close_on_hp'),
                'app_validators', jsonb_build_array('annex_l_calc')
            ),
            'standard_refs', jsonb_build_array('Q6')
        ));

    -- QLD MRTS50
    INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, status, classification, idempotency_key, content)
    VALUES (qld_pack_id, qld_pack_id, 1, true, 'compliance_pack', 'compliance_pack', 'QLD MRTS50 Compliance Pack (2025.03)', org_id, 'approved', 'internal', 'seed:pack:QLD_MRTS50_2025_03',
        jsonb_build_object(
            'jurisdiction', 'QLD',
            'agency', 'TMR',
            'version', '2025.03',
            'required_registers', jsonb_build_array('work_lot_register','hold_witness_register','itp_register','identified_records_register'),
            'itp_requirements', jsonb_build_object('endorsement_required', false),
            'hold_points_spec', jsonb_build_array('Nonconformance HP', 'Critical construction stages'),
            'witness_points_spec', jsonb_build_array('Key activities per spec'),
            'milestones_spec', jsonb_build_array('As-Constructed delivery', 'Practical Completion gating'),
            'records_identified', jsonb_build_array('Lot register','Conformance reports','As Constructed packages'),
            'test_frequency_rules', jsonb_build_array('QRS default levels applicable'),
            'special_workflows', jsonb_build_array('Indicative Conformance'),
            'ui_modules', jsonb_build_array('quality_module'),
            'feature_flags_default', jsonb_build_object('quality_module', true, 'enable_qrs_requirements', true, 'enable_indicative_conformance', true),
            'rules', jsonb_build_object(
                'validators', jsonb_build_array('rq_number_required'),
                'db_invariants', jsonb_build_array('gate_lot_close_on_hp'),
                'app_validators', jsonb_build_array('qrs_requirements')
            ),
            'standard_refs', jsonb_build_array('MRTS50','MRTS01','MRTS04','MRTS70')
        ));

    -- SA PC-QA2
    INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, status, classification, idempotency_key, content)
    VALUES (sa_pack_id, sa_pack_id, 1, true, 'compliance_pack', 'compliance_pack', 'SA PC-QA2 Compliance Pack (2024.09)', org_id, 'approved', 'internal', 'seed:pack:SA_PCQA2_2024_09',
        jsonb_build_object(
            'jurisdiction', 'SA',
            'agency', 'DIT',
            'version', '2024.09',
            'required_registers', jsonb_build_array('work_lot_register','hold_witness_register','itp_register','identified_records_register'),
            'itp_requirements', jsonb_build_object('endorsement_required', false),
            'hold_points_spec', jsonb_build_array('Engineering Authority HP'),
            'witness_points_spec', jsonb_build_array('Documentation and construction quality WPs'),
            'records_identified', jsonb_build_array('As-Built Records','Quality Management Records'),
            'ui_modules', jsonb_build_array('quality_module'),
            'feature_flags_default', jsonb_build_object('quality_module', true, 'roles_required', jsonb_build_array('Construction Quality Representative'), 'ncr_dual_mode', true),
            'rules', jsonb_build_object(
                'db_invariants', jsonb_build_array('gate_lot_close_on_hp')
            ),
            'standard_refs', jsonb_build_array('PC-QA2')
        ));

    -- TAS Section 160
    INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, status, classification, idempotency_key, content)
    VALUES (tas_pack_id, tas_pack_id, 1, true, 'compliance_pack', 'compliance_pack', 'TAS Section 160 Compliance Pack (2025.06)', org_id, 'approved', 'internal', 'seed:pack:TAS_SEC160_2025_06',
        jsonb_build_object(
            'jurisdiction', 'TAS',
            'agency', 'DSG',
            'version', '2025.06',
            'required_registers', jsonb_build_array('work_lot_register','hold_witness_register','itp_register','identified_records_register'),
            'itp_requirements', jsonb_build_object('endorsement_required', false),
            'hold_points_spec', jsonb_build_array('Pre-commencement documents'),
            'witness_points_spec', jsonb_build_array('Work Lot register monthly'),
            'ui_modules', jsonb_build_array('quality_module'),
            'feature_flags_default', jsonb_build_object('quality_module', true),
            'rules', jsonb_build_object(
                'db_invariants', jsonb_build_array('gate_lot_close_on_hp')
            ),
            'standard_refs', jsonb_build_array('Section 160 TAS')
        ));

    -- VIC Section 160 MW
    INSERT INTO public.assets (id, asset_uid, version, is_current, type, subtype, name, organization_id, status, classification, idempotency_key, content)
    VALUES (vic_pack_id, vic_pack_id, 1, true, 'compliance_pack', 'compliance_pack', 'VIC Section 160 MW Compliance Pack (2018.11)', org_id, 'approved', 'internal', 'seed:pack:VIC_SEC160_MW_2018_11',
        jsonb_build_object(
            'jurisdiction', 'VIC',
            'agency', 'DoT/VicRoads',
            'version', '2018.11',
            'required_registers', jsonb_build_array('work_lot_register','hold_witness_register','itp_register','identified_records_register'),
            'itp_requirements', jsonb_build_object('endorsement_required', false),
            'hold_points_spec', jsonb_build_array('Commencement HP', 'Calibration records WP'),
            'ui_modules', jsonb_build_array('quality_module'),
            'feature_flags_default', jsonb_build_object('quality_module', true),
            'rules', jsonb_build_object(
                'db_invariants', jsonb_build_array('gate_lot_close_on_hp')
            ),
            'standard_refs', jsonb_build_array('Section 160 MW VIC')
        ));
END$$;
