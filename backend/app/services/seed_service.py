from decimal import Decimal
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    Institute, InstituteSettings, User, StaffProfile, StaffPermission,
    StudentProfile, AcademicYear, Course, SchoolClass, Batch, Enrollment,
    FeePlan, StudentFeeAssignment, Installment, Payment, PaymentAllocation,
    Receipt, Conversation, ConversationMember, Message, Notification, AuditLog
)
from app.utils.security import hash_password
from app.services.receipt_generator import create_receipt_pdf

async def seed_initial_data(db: AsyncSession):
    # Check if already seeded
    stmt = select(Institute).limit(1)
    result = await db.execute(stmt)
    existing_inst = result.scalar_one_or_none()
    if existing_inst:
        return existing_inst

    print("--- SEEDING PRODUCTION-READY FEEFLOW DATA ---")

    # 1. Institute & Settings
    institute = Institute(
        name="Apex Institute of Science & Technology",
        code="APEX01",
        email="contact@apexinstitute.edu",
        phone="+91 98234 56789",
        address="742 Evergreen Road, Tech Hub Campus, Pune, MH 411001",
        logo_url="https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80",
        currency="INR",
        currency_symbol="₹",
        upi_id="apexinstitute@upi",
    )
    db.add(institute)
    await db.flush()

    settings = InstituteSettings(
        institute_id=institute.id,
        receipt_prefix="REC-2026-",
        receipt_footer_note="Thank you for your payment to Apex Institute. This computer-generated receipt is valid with digital QR verification.",
        allow_student_upi_submission=True,
        enable_whatsapp_reminders=True
    )
    db.add(settings)

    # 2. Users (Admin, Staff, Students)
    # Admin
    admin_user = User(
        institute_id=institute.id,
        login_id="ADM0001",
        hashed_password=hash_password("admin123"),
        role="admin",
        full_name="Dr. Rajesh Sharma",
        email="director@apexinstitute.edu",
        phone="+91 98234 56780",
        is_active=True
    )
    db.add(admin_user)

    # Staff 1 (Senior Accountant)
    staff1_user = User(
        institute_id=institute.id,
        login_id="STF0001",
        hashed_password=hash_password("staff123"),
        role="staff",
        full_name="Anita Verma",
        email="anita.verma@apexinstitute.edu",
        phone="+91 98765 11111",
        is_active=True
    )
    db.add(staff1_user)
    await db.flush()

    staff1_profile = StaffProfile(
        user_id=staff1_user.id,
        institute_id=institute.id,
        staff_id="STF0001",
        designation="Chief Accountant",
        qualification="M.Com, Chartered Accountant (Inter)",
        joining_date=date(2023, 6, 1),
        status="active"
    )
    db.add(staff1_profile)
    await db.flush()

    staff1_perms = StaffPermission(
        staff_profile_id=staff1_profile.id,
        can_collect_fees=True,
        can_verify_upi=True,
        can_send_reminders=True,
        can_view_reports=True,
        can_manage_students=True
    )
    db.add(staff1_perms)

    # Staff 2 (Junior Cashier)
    staff2_user = User(
        institute_id=institute.id,
        login_id="STF0002",
        hashed_password=hash_password("staff123"),
        role="staff",
        full_name="Vikram Malhotra",
        email="vikram.cashier@apexinstitute.edu",
        phone="+91 98765 22222",
        is_active=True
    )
    db.add(staff2_user)
    await db.flush()

    staff2_profile = StaffProfile(
        user_id=staff2_user.id,
        institute_id=institute.id,
        staff_id="STF0002",
        designation="Fee Collection Officer",
        qualification="B.Com Finance",
        joining_date=date(2024, 1, 15),
        status="active"
    )
    db.add(staff2_profile)
    await db.flush()

    staff2_perms = StaffPermission(
        staff_profile_id=staff2_profile.id,
        can_collect_fees=True,
        can_verify_upi=False,
        can_send_reminders=True,
        can_view_reports=True,
        can_manage_students=False
    )
    db.add(staff2_perms)

    # 3. Academic Structure
    acad_year = AcademicYear(
        institute_id=institute.id,
        name="2026-2027",
        start_date=date(2026, 4, 1),
        end_date=date(2027, 3, 31),
        is_current=True
    )
    db.add(acad_year)
    await db.flush()

    course1 = Course(
        institute_id=institute.id,
        name="Full-Stack Software Engineering",
        code="CS-FSE",
        description="Comprehensive engineering curriculum covering web, cloud, database, and system architecture.",
        duration_months=12
    )
    course2 = Course(
        institute_id=institute.id,
        name="Artificial Intelligence & Data Science",
        code="AI-DS",
        description="Applied machine learning, deep neural networks, and business analytics.",
        duration_months=12
    )
    db.add_all([course1, course2])
    await db.flush()

    class1 = SchoolClass(
        course_id=course1.id,
        name="Year 1 - Semester 1",
        code="FSE-Y1S1"
    )
    class2 = SchoolClass(
        course_id=course2.id,
        name="Year 1 - Semester 1",
        code="AIDS-Y1S1"
    )
    db.add_all([class1, class2])
    await db.flush()

    batch1 = Batch(
        class_id=class1.id,
        name="Morning Batch Alpha",
        code="FSE-M-ALPHA",
        max_capacity=50
    )
    batch2 = Batch(
        class_id=class2.id,
        name="Afternoon Batch Beta",
        code="AIDS-A-BETA",
        max_capacity=45
    )
    db.add_all([batch1, batch2])
    await db.flush()

    # 4. Fee Plans
    plan1 = FeePlan(
        institute_id=institute.id,
        course_id=course1.id,
        name="Full-Stack Engineering Annual Fee Plan",
        description="Annual comprehensive fee structure with 4 quarterly installments",
        admission_fee=Decimal("5000.00"),
        tuition_fee=Decimal("40000.00"),
        examination_fee=Decimal("3000.00"),
        library_fee=Decimal("2000.00"),
        transport_fee=Decimal("5000.00"),
        custom_fee=Decimal("0.00"),
        total_amount=Decimal("55000.00"),
        installment_frequency="quarterly",
        number_of_installments=4,
        is_active=True
    )

    plan2 = FeePlan(
        institute_id=institute.id,
        course_id=course2.id,
        name="AI & Data Science Standard Plan",
        description="Standard 3-installment payment plan for AI specialization",
        admission_fee=Decimal("6000.00"),
        tuition_fee=Decimal("36000.00"),
        examination_fee=Decimal("3000.00"),
        library_fee=Decimal("3000.00"),
        transport_fee=Decimal("0.00"),
        custom_fee=Decimal("0.00"),
        total_amount=Decimal("48000.00"),
        installment_frequency="quarterly",
        number_of_installments=3,
        is_active=True
    )
    db.add_all([plan1, plan2])
    await db.flush()

    # 5. Students
    student_specs = [
        {
            "login_id": "STU0001",
            "name": "Aarav Patel",
            "email": "aarav.patel@student.apexinstitute.edu",
            "phone": "+91 91234 56781",
            "dob": date(2004, 5, 14),
            "gender": "male",
            "guardian_name": "Suresh Patel",
            "guardian_phone": "+91 91234 56780",
            "address": "Flat 402, Shanti Heights, Shivaji Nagar, Pune",
            "batch": batch1,
            "plan": plan1,
            "discount": Decimal("0.00"),
            "scholarship": Decimal("0.00"),
        },
        {
            "login_id": "STU0002",
            "name": "Priya Sharma",
            "email": "priya.sharma@student.apexinstitute.edu",
            "phone": "+91 91234 56782",
            "dob": date(2005, 3, 22),
            "gender": "female",
            "guardian_name": "Ramesh Sharma",
            "guardian_phone": "+91 91234 56789",
            "address": "B-12 Greenwood Residency, Baner, Pune",
            "batch": batch1,
            "plan": plan1,
            "discount": Decimal("2000.00"),
            "discount_reason": "Early Admission Merit Waiver",
            "scholarship": Decimal("8000.00"),
            "scholarship_reason": "State Academic Excellence Scholarship",
        },
        {
            "login_id": "STU0003",
            "name": "Rohan Nair",
            "email": "rohan.nair@student.apexinstitute.edu",
            "phone": "+91 91234 56783",
            "dob": date(2004, 9, 10),
            "gender": "male",
            "guardian_name": "Mohan Nair",
            "guardian_phone": "+91 91234 56788",
            "address": "Plot 88, Viman Nagar, Pune",
            "batch": batch2,
            "plan": plan2,
            "discount": Decimal("0.00"),
            "scholarship": Decimal("0.00"),
        },
        {
            "login_id": "STU0004",
            "name": "Ananya Iyer",
            "email": "ananya.iyer@student.apexinstitute.edu",
            "phone": "+91 91234 56784",
            "dob": date(2005, 11, 29),
            "gender": "female",
            "guardian_name": "Karthik Iyer",
            "guardian_phone": "+91 91234 56787",
            "address": "14 Kothrud Hills, Paud Road, Pune",
            "batch": batch2,
            "plan": plan2,
            "discount": Decimal("0.00"),
            "scholarship": Decimal("0.00"),
        }
    ]

    created_students = []
    for spec in student_specs:
        s_user = User(
            institute_id=institute.id,
            login_id=spec["login_id"],
            hashed_password=hash_password("student123"),
            role="student",
            full_name=spec["name"],
            email=spec["email"],
            phone=spec["phone"],
            is_active=True
        )
        db.add(s_user)
        await db.flush()

        s_profile = StudentProfile(
            user_id=s_user.id,
            institute_id=institute.id,
            student_id=spec["login_id"],
            dob=spec["dob"],
            gender=spec["gender"],
            guardian_name=spec["guardian_name"],
            guardian_phone=spec["guardian_phone"],
            address=spec["address"],
            admission_date=date(2026, 4, 15),
            status="active"
        )
        db.add(s_profile)
        await db.flush()

        # Enrollment
        enr = Enrollment(
            student_id=s_profile.id,
            batch_id=spec["batch"].id,
            academic_year_id=acad_year.id,
            roll_number=spec["login_id"].replace("STU", "R-"),
            status="active"
        )
        db.add(enr)

        # Fee Assignment
        plan = spec["plan"]
        base = plan.total_amount
        disc = spec.get("discount", Decimal("0.00"))
        schol = spec.get("scholarship", Decimal("0.00"))
        net = base - disc - schol

        fee_asgn = StudentFeeAssignment(
            student_id=s_profile.id,
            fee_plan_id=plan.id,
            base_amount=base,
            discount_amount=disc,
            scholarship_amount=schol,
            discount_reason=spec.get("discount_reason"),
            scholarship_reason=spec.get("scholarship_reason"),
            net_payable=net,
            total_paid=Decimal("0.00"),
            remaining_balance=net,
            status="pending"
        )
        db.add(fee_asgn)
        await db.flush()

        # Generate Installments
        inst_count = plan.number_of_installments
        inst_due = (net / Decimal(inst_count)).quantize(Decimal("0.01"))
        start_month = date.today().replace(day=10)

        installments = []
        for i in range(1, inst_count + 1):
            due_d = start_month + timedelta(days=30 * (i - 1))
            inst = Installment(
                fee_assignment_id=fee_asgn.id,
                installment_number=i,
                title=f"Installment {i} ({due_d.strftime('%b %Y')})",
                due_amount=inst_due,
                paid_amount=Decimal("0.00"),
                due_date=due_d,
                status="pending"
            )
            installments.append(inst)
            db.add(inst)
        await db.flush()

        created_students.append({
            "user": s_user,
            "profile": s_profile,
            "assignment": fee_asgn,
            "installments": installments,
            "spec": spec
        })

    # 6. Seed Realistic Payments & Receipts
    # Student 1: Aarav Patel pays Installment 1 (₹13,750) via UPI verified
    s1 = created_students[0]
    s1_inst1 = s1["installments"][0]
    p1_amount = Decimal("13750.00")
    p1 = Payment(
        institute_id=institute.id,
        student_id=s1["profile"].id,
        collected_by_user_id=staff1_user.id,
        amount=p1_amount,
        payment_method="upi",
        transaction_ref="UPI684729103847",
        payment_date=date.today() - timedelta(days=5),
        status="verified",
        notes="Online UPI received and reconciled with bank."
    )
    db.add(p1)
    await db.flush()

    # Allocate
    alloc1 = PaymentAllocation(
        payment_id=p1.id,
        installment_id=s1_inst1.id,
        allocated_amount=p1_amount
    )
    db.add(alloc1)

    s1_inst1.paid_amount = p1_amount
    s1_inst1.status = "paid"
    s1["assignment"].total_paid += p1_amount
    s1["assignment"].remaining_balance -= p1_amount
    s1["assignment"].status = "partial"

    # Receipt for P1
    rec1_num = "REC-2026-0001"
    rec1_data = {
        "receipt_number": rec1_num,
        "payment_date": p1.payment_date.strftime("%d %b %Y"),
        "institute_name": institute.name,
        "institute_code": institute.code,
        "institute_address": institute.address,
        "institute_phone": institute.phone,
        "student_name": s1["spec"]["name"],
        "student_id": s1["profile"].student_id,
        "course_name": course1.name,
        "batch_name": batch1.name,
        "amount_paid": float(p1_amount),
        "balance_after": float(s1["assignment"].remaining_balance),
        "payment_method": "UPI",
        "transaction_ref": p1.transaction_ref,
        "installment_title": s1_inst1.title,
        "collected_by": staff1_user.full_name,
        "verification_url": f"http://localhost:3000/verify-receipt/{rec1_num}"
    }
    pdf_filename1 = f"{rec1_num}.pdf"
    create_receipt_pdf(rec1_data, pdf_filename1)

    receipt1 = Receipt(
        payment_id=p1.id,
        receipt_number=rec1_num,
        amount_paid=p1_amount,
        balance_after=s1["assignment"].remaining_balance,
        qr_code_data=f"http://localhost:3000/verify-receipt/{rec1_num}",
        pdf_filename=pdf_filename1,
        generated_at=datetime.utcnow() - timedelta(days=5)
    )
    db.add(receipt1)

    # Student 2: Priya Sharma pays full tuition (₹45,000) in 2 bank transfers
    s2 = created_students[1]
    p2_amount = Decimal("45000.00")
    p2 = Payment(
        institute_id=institute.id,
        student_id=s2["profile"].id,
        collected_by_user_id=admin_user.id,
        amount=p2_amount,
        payment_method="bank_transfer",
        transaction_ref="NEFT-HDFC-99382103",
        payment_date=date.today() - timedelta(days=12),
        status="verified",
        notes="Full fee paid directly to HDFC institute account"
    )
    db.add(p2)
    await db.flush()

    for inst in s2["installments"]:
        alloc = PaymentAllocation(
            payment_id=p2.id,
            installment_id=inst.id,
            allocated_amount=inst.due_amount
        )
        db.add(alloc)
        inst.paid_amount = inst.due_amount
        inst.status = "paid"

    s2["assignment"].total_paid = p2_amount
    s2["assignment"].remaining_balance = Decimal("0.00")
    s2["assignment"].status = "paid"

    rec2_num = "REC-2026-0002"
    rec2_data = {
        "receipt_number": rec2_num,
        "payment_date": p2.payment_date.strftime("%d %b %Y"),
        "institute_name": institute.name,
        "institute_code": institute.code,
        "institute_address": institute.address,
        "institute_phone": institute.phone,
        "student_name": s2["spec"]["name"],
        "student_id": s2["profile"].student_id,
        "course_name": course1.name,
        "batch_name": batch1.name,
        "amount_paid": float(p2_amount),
        "balance_after": 0.0,
        "payment_method": "Bank Transfer (NEFT)",
        "transaction_ref": p2.transaction_ref,
        "installment_title": "Full Academic Fee 2026-27",
        "collected_by": admin_user.full_name,
        "verification_url": f"http://localhost:3000/verify-receipt/{rec2_num}"
    }
    pdf_filename2 = f"{rec2_num}.pdf"
    create_receipt_pdf(rec2_data, pdf_filename2)

    receipt2 = Receipt(
        payment_id=p2.id,
        receipt_number=rec2_num,
        amount_paid=p2_amount,
        balance_after=Decimal("0.00"),
        qr_code_data=f"http://localhost:3000/verify-receipt/{rec2_num}",
        pdf_filename=pdf_filename2,
        generated_at=datetime.utcnow() - timedelta(days=12)
    )
    db.add(receipt2)

    # Student 3: Rohan Nair has an overdue installment!
    s3 = created_students[2]
    s3_inst1 = s3["installments"][0]
    s3_inst1.due_date = date.today() - timedelta(days=15)
    s3_inst1.status = "overdue"

    # Student 4: Ananya Iyer has a pending UPI payment submission awaiting verification
    s4 = created_students[3]
    p4_amount = Decimal("16000.00")
    p4 = Payment(
        institute_id=institute.id,
        student_id=s4["profile"].id,
        collected_by_user_id=None,
        amount=p4_amount,
        payment_method="upi",
        transaction_ref="UPI893472910482",
        payment_date=date.today(),
        status="pending_verification",
        notes="Student submitted UPI reference via portal. Awaiting bank reconciliation."
    )
    db.add(p4)
    await db.flush()

    # 7. Seed Real-time Chat Conversation & Messages
    conv1 = Conversation(
        institute_id=institute.id,
        title="Admin & Accounts Helpdesk",
        is_direct=True,
        last_message_at=datetime.utcnow()
    )
    db.add(conv1)
    await db.flush()

    m1 = ConversationMember(conversation_id=conv1.id, user_id=admin_user.id)
    m2 = ConversationMember(conversation_id=conv1.id, user_id=staff1_user.id)
    db.add_all([m1, m2])

    msg1 = Message(
        conversation_id=conv1.id,
        sender_id=admin_user.id,
        content="Hello Anita, please verify the pending UPI payment submitted by student Ananya Iyer today.",
        is_read=True
    )
    msg2 = Message(
        conversation_id=conv1.id,
        sender_id=staff1_user.id,
        content="Understood Dr. Sharma. I will cross-check with the bank portal and verify the transaction.",
        is_read=True
    )
    db.add_all([msg1, msg2])

    # Conversation 2: Staff Anita & Student Aarav
    conv2 = Conversation(
        institute_id=institute.id,
        title="Student Support Desk",
        is_direct=True,
        last_message_at=datetime.utcnow()
    )
    db.add(conv2)
    await db.flush()

    m3 = ConversationMember(conversation_id=conv2.id, user_id=staff1_user.id)
    m4 = ConversationMember(conversation_id=conv2.id, user_id=s1["user"].id)
    db.add_all([m3, m4])

    msg3 = Message(
        conversation_id=conv2.id,
        sender_id=s1["user"].id,
        content="Respected Madam, I downloaded my fee receipt REC-2026-0001. When is the next installment due?",
        is_read=True
    )
    msg4 = Message(
        conversation_id=conv2.id,
        sender_id=staff1_user.id,
        content="Hi Aarav, your next installment is due on the 10th of next month. You can view your schedule anytime in your portal.",
        is_read=True
    )
    db.add_all([msg3, msg4])

    # 8. Notifications
    n1 = Notification(
        user_id=admin_user.id,
        title="Pending UPI Payment Verification",
        message="Student Ananya Iyer (STU0004) has submitted a UPI payment of ₹16,000 for verification.",
        notification_type="payment",
        action_url="/admin/payments"
    )
    n2 = Notification(
        user_id=staff1_user.id,
        title="Fee Overdue Alert",
        message="Rohan Nair (STU0003) has an installment overdue by 15 days.",
        notification_type="overdue",
        action_url="/staff/reminders"
    )
    n3 = Notification(
        user_id=s1["user"].id,
        title="Payment Receipt Generated",
        message="Your payment of ₹13,750 was verified. Receipt REC-2026-0001 is now ready for download.",
        notification_type="payment",
        action_url="/student/receipts"
    )
    db.add_all([n1, n2, n3])

    # 9. Audit Logs
    audit1 = AuditLog(
        institute_id=institute.id,
        user_id=staff1_user.id,
        action="PAYMENT_VERIFIED",
        target_type="payment",
        target_id=p1.id,
        details={"amount": 13750.0, "student_id": s1["profile"].student_id, "method": "upi"}
    )
    audit2 = AuditLog(
        institute_id=institute.id,
        user_id=admin_user.id,
        action="PAYMENT_RECORDED",
        target_type="payment",
        target_id=p2.id,
        details={"amount": 45000.0, "student_id": s2["profile"].student_id, "method": "bank_transfer"}
    )
    db.add_all([audit1, audit2])

    await db.commit()
    print("--- PRODUCTION-READY SEEDING COMPLETED SUCCESSFULLY ---")
    return institute
