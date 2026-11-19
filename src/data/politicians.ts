export interface Politician {
  id: string;
  cardNo: string;
  name: string;
  kana?: string;
  party: string;
  partyCategory: string; // 絞り込み用政党カテゴリー（地域会派は「無所属」に分類）
  chamber: "衆議院" | "参議院" | "地方議会";
  title: string;
  divisionText: string;
  category?: string;
  prefecture: string; // "国会" または 都道府県名
  region?: string;
  questionDate: string;
  questionYear: number;
  themes: ("早産児支援" | "母乳バンク" | "付き添い入院")[];
  summary: string;
  fullContent?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  xPostUrl?: string;
}

export const POLITICIANS_DATA: Politician[] = [
  {
    id: "01",
    cardNo: "紹介カード 01",
    name: "古川あおい",
    kana: "ふるかわ あおい",
    party: "チームみらい",
    partyCategory: "チームみらい",
    chamber: "衆議院",
    title: "チームみらい・衆議院議員（比例九州沖縄）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2026年3月9日",
    questionYear: 2026,
    themes: ["早産児支援"],
    summary:
      "2026年3月9日の衆議院予算委員会で、育休延長の判断に修正月齢を入れること、長期入院中の子は医師の診断書で延長を認める仕組み、「出産なび」の情報拡充（NICUの受入条件まで）を求めた。",
    sourceTitle: "チームみらい公式note",
    sourceUrl: "https://note.com/team_mirai_jp/n/n01ba4a45e5a2",
    xPostUrl: "https://x.com/lsvsince2026/status/2119966931537244204"
  },
  {
    id: "02",
    cardNo: "紹介カード 02",
    name: "細野豪志",
    kana: "ほその ごうし",
    party: "自民党",
    partyCategory: "自民党",
    chamber: "衆議院",
    title: "自民党・衆議院議員（静岡5区）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2013年",
    questionYear: 2013,
    themes: ["早産児支援"],
    summary:
      "第二子が637gで生まれた当事者として、低出生体重児の「就学猶予」に取り組み続けてきた。2013年の国会質問をきっかけに文科省が事務連絡を出し、2024年には制度を当事者に届ける新たな事務連絡につながった。",
    sourceTitle: "細野豪志 note",
    sourceUrl: "https://note.com/hosono_54/n/n17cd1ce43d12",
    xPostUrl: "https://x.com/lsvsince2026/status/2119967997632860541"
  },
  {
    id: "03",
    cardNo: "紹介カード 03",
    name: "秋野公造",
    kana: "あきの こうぞう",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "参議院",
    title: "公明党・参議院議員（福岡選挙区）",
    divisionText: "国会｜国会（参議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2025年5月19日",
    questionYear: 2025,
    themes: ["早産児支援"],
    summary:
      "医師・元厚労省医系技官。2025年5月、国立成育医療研究センターの財政危機を参院予算委員会で訴え、首相から「財政的な支援も含めて検討する」との答弁を引き出した。その後、交付金は増額され令和8年度予算に計上された。",
    sourceTitle: "公明党ニュース",
    sourceUrl: "https://www.komei.or.jp/komeinews/p419254/",
    xPostUrl: "https://x.com/lsvsince2026/status/2119970406685868119"
  },
  {
    id: "04",
    cardNo: "紹介カード 04",
    name: "たかの久仁子",
    kana: "たかの くにこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・北九州市議会議員（小倉南区）",
    divisionText: "福岡県・北九州市｜北九州市議会",
    prefecture: "福岡県",
    region: "福岡県",
    questionDate: "2026年6月9日",
    questionYear: 2026,
    themes: ["母乳バンク"],
    summary:
      "保育を学び幼稚園や病院の託児所で働いてきた市議1期目。2026年6月9日、産後ケアの文脈でドナーミルクの周知を求め、「市内にドナー登録できる医療機関がない」という答弁を受けて、赤ちゃんの命に関わる取組として重ねて要望した。",
    sourceTitle: "北九州市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/kitakyushu/SpMinuteView.html?council_id=1544&schedule_id=5&minute_id=4",
    xPostUrl: "https://x.com/lsvsince2026/status/2119975137537896826"
  },
  {
    id: "05",
    cardNo: "紹介カード 05",
    name: "豊田真由子",
    kana: "とよた まゆこ",
    party: "参政党",
    partyCategory: "参政党",
    chamber: "衆議院",
    title: "参政党・衆議院議員（比例北関東）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2026年6月19日",
    questionYear: 2026,
    themes: ["付き添い入院"],
    summary:
      "元厚労省官僚。2026年6月19日、成育医療研究センター視察を踏まえ、看護配置基準や診療報酬が現場の実態に合っていないこと、簡易ベッドで寝て食事も取れない付き添い家族の実態と、寄附とボランティア頼みの滞在施設の全国展開を質問した。",
    sourceTitle: "衆議院 会議録",
    sourceUrl: "https://www.shugiin.go.jp/internet/itdb_kaigiroku.nsf/html/kaigiroku/009722120260619016.htm",
    xPostUrl: "https://x.com/lsvsince2026/status/2119985224327278703"
  },
  {
    id: "06",
    cardNo: "紹介カード 06",
    name: "後藤香織",
    kana: "ごとう かおり",
    party: "ふくおか政策の会",
    partyCategory: "無所属",
    chamber: "地方議会",
    title: "ふくおか政策の会・福岡県議会議員（福岡市早良区）",
    divisionText: "福岡県｜福岡県議会",
    prefecture: "福岡県",
    region: "福岡県",
    questionDate: "2025年6月25日",
    questionYear: 2025,
    themes: ["付き添い入院"],
    summary:
      "自身も付き添い入院の経験者。2025年6月25日、福岡は病院が付き添いを求める割合が全国より高い実態と、小児入院医療管理料の届出が県内31.5%（29機関）にとどまることを示し、NPOの食事支援やファミリーハウスへの支援を求め、最後に部長の決意を問うた。",
    sourceTitle: "後藤香織 公式サイト",
    sourceUrl: "https://www.gotokaori.com/202506yosan02/",
    xPostUrl: "https://x.com/lsvsince2026/status/2120001950351815138"
  },
  {
    id: "07",
    cardNo: "紹介カード 07",
    name: "三森至加",
    kana: "みもり ゆきか",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・熊本市議会議員（中央区）",
    divisionText: "熊本県・熊本市｜熊本市議会",
    prefecture: "熊本県",
    region: "熊本県",
    questionDate: "2026年6月11日",
    questionYear: 2026,
    themes: ["早産児支援", "母乳バンク"],
    summary:
      "障がいのある子を育てる母親で市議3期目。2026年6月11日、市が参画する県の「リトルエンジェル支援事業」の先にある家族同士のつながりの場づくり、熊本市民病院でのドナーミルク活用、搾乳マークを一体で質問。病院事業管理者は市民病院でドナーミルクの「導入を具体的に検討」と答弁した。",
    sourceTitle: "熊本市議会 会議録",
    sourceUrl: "https://kumamoto-shigikai.jp/common/UploadFileDsp.aspx?c_id=51&id=257&sub_id=317&flid=7231",
    xPostUrl: "https://x.com/lsvsince2026/status/2120054054332289287"
  },
  {
    id: "08",
    cardNo: "紹介カード 08",
    name: "沼崎満子",
    kana: "ぬまざき みつこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "衆議院",
    title: "公明党・衆議院議員（比例南関東）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2025年11月28日",
    questionYear: 2025,
    themes: ["母乳バンク"],
    summary:
      "麻酔科医・医学博士で、総合病院の手術部長を務めた。2025年11月28日の衆議院・厚生労働委員会で、ドナーミルクの法的な位置づけ（食品か、医薬品か、それ以外か）と費用の枠組みを質問。こども家庭庁は「位置づけは検討中、安全基準やマニュアルは公表済み」、厚労省は「位置づけが定まれば、医薬品や食事療養費として保険適用もありうる」と答弁した。",
    sourceTitle: "衆議院 会議録",
    sourceUrl: "https://kokkai.ndl.go.jp/#/detail?minId=121904260X00620251128&spkNum=165&current=1",
    xPostUrl: "https://x.com/lsvsince2026/status/2120095207522017774"
  },
  {
    id: "09",
    cardNo: "紹介カード 09",
    name: "川上多恵",
    kana: "かわかみ たえ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・福岡県議会議員（博多区）",
    divisionText: "福岡県｜福岡県議会",
    prefecture: "福岡県",
    region: "福岡県",
    questionDate: "2025年6月20日",
    questionYear: 2025,
    themes: ["早産児支援"],
    summary:
      "政策に「医療的ケア児・者と、その家族への支援を拡充」を掲げる。2025年6月20日の県議会一般質問で「誰もが安心して搾乳できる環境づくりについて」を質問し、NICUに入院する小さな赤ちゃんの母親の搾乳の実情から、神奈川県議団とNPO法人penaが取り組む「搾乳できます」マークの活用を知事に求めた。県庁舎の授乳室への表示実施などの答弁を引き出した。",
    sourceTitle: "福岡県議会 会議録",
    sourceUrl: "https://www.pref.fukuoka.dbsr.jp/230368?Template=document&Id=3937",
    xPostUrl: "https://x.com/lsvsince2026/status/2120105087842583000"
  },
  {
    id: "10",
    cardNo: "紹介カード 10",
    name: "阿部司",
    kana: "あべ つかさ",
    party: "日本維新の会",
    partyCategory: "日本維新の会",
    chamber: "衆議院",
    title: "日本維新の会・衆議院議員（東京12区）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2023年2月20日",
    questionYear: 2023,
    themes: ["付き添い入院"],
    summary:
      "2023年2月20日の衆議院予算委員会分科会で、未就学児の入院に24時間の付き添いへの同意が入院の条件にされている事例を追及し、加藤厚労相から「同意しなければ入院を認めないことは、療養担当規則にのっとったものとは言えない」との答弁を引き出した。",
    sourceTitle: "衆議院 会議録",
    sourceUrl: "https://www.shugiin.go.jp/internet/itdb_kaigiroku.nsf/html/kaigiroku/003521120230220001.htm",
    xPostUrl: "https://x.com/lsvsince2026/status/2120131277231989148"
  },
  {
    id: "11",
    cardNo: "紹介カード 11",
    name: "森山由美子",
    kana: "もりやま ゆみこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・札幌市議会議員（西区）",
    divisionText: "北海道・札幌市｜札幌市議会",
    prefecture: "北海道",
    region: "北海道",
    questionDate: "2022年10月・2025年3月",
    questionYear: 2025,
    themes: ["早産児支援"],
    summary:
      "2022年に、通常の母子健康手帳では身長40センチ・体重1キロ未満の成長を記録できない問題を指摘し、低出生体重児用リーフレットの見直し（母子健康手帳サイズ化と「成長の達成」欄の追加）の答弁を得た。2025年には、外出先でトイレで搾乳する母親の実態を挙げ、授乳室で安心して搾乳できる環境づくりを求めた。",
    sourceTitle: "札幌市議会 会議録",
    sourceUrl: "https://sapporo.gijiroku.com/voices/cgi/voiweb.exe?ACT=200&KENSAKU=1&SORT=0&KTYP=1,2,3,0&FBKEY1=%92%E1%8Fo%90%B6%91%CC%8Fd%8E%99&FBMODE1=PERFECT&FBMODE2=SYNONYM&FBMODE3=SYNONYM&FBMODE4=SYNONYM&KGTP=1,2,3&NAMES=%90X%8ER%97R%94%FC%8Eq&TITL_SUBT=%97%DF%98a%81@%82V%94N%91%E6%88%EA%95%94%97%5C%8EZ%93%C1%95%CA%88%CF%88%F5%89%EF%81%7C03%8C%8E19%93%FA-08%8D%86&KGNO=659&FINO=4544&HUID=253493&UNID=k_r0703192008108",
    xPostUrl: "https://x.com/lsvsince2026/status/2120135092211425679"
  },
  {
    id: "12",
    cardNo: "紹介カード 12",
    name: "佐々木さやか",
    kana: "ささき さやか",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "参議院",
    title: "公明党・前参議院議員（神奈川選挙区）",
    divisionText: "国会｜国会（参議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2024年12月16日",
    questionYear: 2024,
    themes: ["早産児支援"],
    summary:
      "弁護士で働く母。2024年12月16日の参議院予算委員会で、赤ちゃんを連れていないと授乳室に入りづらいというリトルベビーの母親の声を挙げ、地元・神奈川の「搾乳できます」マークを紹介。国土交通省のガイドラインへの明記を求め、その後2025年5月に国の建築設計標準へ明記された。",
    sourceTitle: "参議院 会議録",
    sourceUrl: "https://kokkai.ndl.go.jp/#/detail?minId=121615261X00420241216&spkNum=16&current=1",
    xPostUrl: "https://x.com/lsvsince2026/status/2120149841992974786"
  },
  {
    id: "13",
    cardNo: "紹介カード 13",
    name: "田原香代子",
    kana: "たはら かよこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・福岡市議会議員（中央区）",
    divisionText: "福岡県・福岡市｜福岡市議会",
    prefecture: "福岡県",
    region: "福岡県",
    questionDate: "2025年9月4日",
    questionYear: 2025,
    themes: ["早産児支援"],
    summary:
      "2025年9月4日の福岡市議会一般質問で、1,500g未満で生まれた子の話から、NPO法人penaの「搾乳できます」マークを紹介し、福岡市でも授乳室への掲示と環境づくりを求めた。市の答弁は、「赤ちゃんの駅」の授乳室は現行でも搾乳利用が可能で、今後も気兼ねなく利用できるよう検討する、という内容だった。",
    sourceTitle: "福岡市議会 会議録",
    sourceUrl: "https://gikai.city.fukuoka.lg.jp/wp-content/uploads/2025/11/R07.09.04.htm"
  },
  {
    id: "14",
    cardNo: "紹介カード 14",
    name: "石川美香",
    kana: "いしかわ みか",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・千葉市議会議員（花見川区）",
    divisionText: "千葉県・千葉市｜千葉市議会",
    prefecture: "千葉県",
    region: "千葉県",
    questionDate: "2025年6月18日",
    questionYear: 2025,
    themes: ["早産児支援"],
    summary:
      "2児の母で、職場復帰のときに搾乳できる場所がなかった自身の経験から、2025年6月の千葉市議会一般質問で『授乳室で搾乳できることが一目で分かる表示』を求めた。市は『赤ちゃんの駅』登録施設の入口などに搾乳可能の表示に取り組むと答弁。神奈川県の『搾乳できます』マークも紹介し、千葉市での活用を要望した。",
    sourceTitle: "千葉市議会 会議録",
    sourceUrl: "https://ishikawa-mika.com/gikai/docs/%E4%BB%A4%E5%92%8C7%E5%B9%B46%E6%9C%88%E5%AE%9A%E4%BE%8B%E4%BC%9A.pdf",
    xPostUrl: "https://x.com/lsvsince2026/status/2120236380588818777"
  },
  {
    id: "15",
    cardNo: "紹介カード 15",
    name: "今枝宗一郎",
    kana: "いまえだ そういちろう",
    party: "自民党",
    partyCategory: "自民党",
    chamber: "衆議院",
    title: "自民党・衆議院議員（愛知14区）",
    divisionText: "国会｜国会（衆議院）",
    prefecture: "国会",
    region: "国会",
    questionDate: "2023年6月15日",
    questionYear: 2023,
    themes: ["付き添い入院"],
    summary:
      "名古屋大学医学部卒の医師で、自身も子ども時代に3年間入退院を繰り返した経験がある。2023年6月の衆議院特別委員会で、入院する子どもは約3万人、泊まり込みの付き添い経験率は85％（聖路加国際大学の調査）という実態を示し、居宅訪問型保育を入院中も使えるようにする提案をした。小倉こども政策担当大臣が、こども家庭庁が厚労省と連携して小児の入院医療機関を対象に家族の付添時の課題について調査を実施すると答弁した。",
    sourceTitle: "衆議院 会議録",
    sourceUrl: "https://kokkai.ndl.go.jp/simple/detail?minId=121105367X01520230615&spkNum=67",
    xPostUrl: "https://x.com/lsvsince2026/status/2120240076307505371"
  },
  {
    id: "16",
    cardNo: "紹介カード 16",
    name: "黒田澄子",
    kana: "くろだ すみこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・日置市議会議員",
    divisionText: "鹿児島県・日置市｜日置市議会",
    prefecture: "鹿児島県",
    region: "鹿児島県",
    questionDate: "2024年11月29日",
    questionYear: 2024,
    themes: ["早産児支援"],
    summary:
      "2022年にリトルベビーの写真展で当事者の声を聞き取り、2024年11月29日の日置市議会一般質問で、520グラムで生まれた子の母親の話とNICU視察を踏まえ、搾乳機と母乳パックへの助成を提案。市長は支援について研究すると答弁し、2026年4月から「低出生体重児等支援事業」（費用の2分の1・上限2万円）が始まった。",
    sourceTitle: "日置市議会 会議録",
    sourceUrl: "https://www.city.hioki.kagoshima.jp/documents/45/r6_5_giji.pdf",
    xPostUrl: "https://x.com/lsvsince2026/status/2120384488916328884"
  },
  {
    id: "17",
    cardNo: "紹介カード 17",
    name: "中村今朝子",
    kana: "なかむら けさこ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・安曇野市議会議員",
    divisionText: "長野県・安曇野市｜安曇野市議会",
    prefecture: "長野県",
    region: "長野県",
    questionDate: "2026年6月17日",
    questionYear: 2026,
    themes: ["早産児支援"],
    summary:
      "3番目の娘さんが2,000グラム以下で生まれ、約1か月入院し、毎日母乳を絞って届けた自身の経験から、2026年6月17日の一般質問で「低出生体重児等の支援について」を質問。未熟児養育医療の現状（令和7年度29人・約783万円）を確認し、日置市の搾乳機・母乳パック助成（費用の2分の1・上限2万円）を「全国初の取組」と紹介して、本市でも頑張るお母さんの手助けをと見解を尋ねた。市は購入補助は現時点では考えていないが、伴走支援に重点を置く中で今後研究すると答弁。",
    sourceTitle: "安曇野市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/azumino/SpMinuteView.html?tenant_id=146&council_id=457&schedule_id=3",
    xPostUrl: "https://x.com/lsvsince2026/status/2120467691421188205"
  },
  {
    id: "18",
    cardNo: "紹介カード 18",
    name: "大竹いずみ",
    kana: "おおたけ いずみ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・大阪府議会議員（吹田市）",
    divisionText: "大阪府｜大阪府議会",
    prefecture: "大阪府",
    region: "大阪府",
    questionDate: "2025年6月10日",
    questionYear: 2025,
    themes: ["母乳バンク", "早産児支援"],
    summary:
      "2025年6月10日の大阪府議会一般質問で、「ドナー登録できる医療機関が府内に1つもない」実態を示し、登録施設の設置への働きかけを求めた。リトルベビーハンドブックの確実な配布と「搾乳できます」マークの掲示も質問。その後、府のドナーミルク利用支援事業が始まった。",
    sourceTitle: "大阪府議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/prefosaka/SpMinuteView.html?council_id=2368&schedule_id=3&minute_id=52",
    xPostUrl: "https://x.com/lsvsince2026/status/2120738579341287577"
  },
  {
    id: "19",
    cardNo: "紹介カード 19",
    name: "しのはらりか",
    kana: "しのはら りか",
    party: "無所属",
    partyCategory: "無所属",
    chamber: "地方議会",
    title: "無所属・東京都議会議員（品川区）",
    divisionText: "東京都｜東京都議会",
    prefecture: "東京都",
    region: "東京都",
    questionDate: "2025年",
    questionYear: 2025,
    themes: ["付き添い入院"],
    summary:
      "医療的ケア児の母で社会福祉士。息子の肝移植の際に3か月間の付き添い入院を経験し、都議会で付き添う家族の環境改善を質問。都立病院での病院食提供や、国の環境改善事業の都内実施につながりました。",
    sourceTitle: "東京都議会 会議録",
    sourceUrl: "https://www.record.gikai.metro.tokyo.lg.jp/380055?Template=document&Id=19632#one:100",
    xPostUrl: "https://x.com/lsvsince2026/status/2120859054667120883"
  },
  {
    id: "20",
    cardNo: "紹介カード 20",
    name: "高野たかひろ",
    kana: "たかの たかひろ",
    party: "都民ファーストの会",
    partyCategory: "都民ファーストの会",
    chamber: "地方議会",
    title: "都民ファーストの会・東京都議会議員（世田谷区）",
    divisionText: "東京都｜東京都議会",
    prefecture: "東京都",
    region: "東京都",
    questionDate: "2026年2月27日",
    questionYear: 2026,
    themes: ["付き添い入院"],
    summary:
      "元TBSアナウンサーで、医療的ケア児の父。娘の入院時に硬いソファーベッドで夜を明かした経験から、付添人の環境改善を質問し、都から支援を広げる働きかけの答弁を得ました。",
    sourceTitle: "東京都議会 会議録",
    sourceUrl: "https://www.gikai.metro.tokyo.lg.jp/record/proceedings/2026-1/04-04.html",
    xPostUrl: "https://x.com/lsvsince2026/status/2120867238479802583"
  },
  {
    id: "21",
    cardNo: "紹介カード 21",
    name: "くまだ智子",
    kana: "くまだ ともこ",
    party: "立憲民主党",
    partyCategory: "立憲民主党",
    chamber: "地方議会",
    title: "立憲民主党・板橋区議会議員",
    divisionText: "東京都・板橋区｜板橋区議会",
    prefecture: "東京都",
    region: "東京都",
    questionDate: "2024年9月24日",
    questionYear: 2024,
    themes: ["付き添い入院"],
    summary:
      "元保育士。2024年9月、区議会で「子どもの付き添い入院について」を質問。付き添う保護者の約8割がコンビニで食事を済ませる実態を示し、区内の実態調査と区独自の支援策での人材確保を求めました。",
    sourceTitle: "板橋区議会 会議録",
    sourceUrl: "https://itabashi.gijiroku.com/voices/cgi/voiweb.exe?ACT=200&KENSAKU=0&SORT=0&KTYP=0,1,2,3&KGTP=1,2&FYY=2024&TYY=2024&TITL_SUBT=%97%DF%98a6%94N%91%E63%89%F1%92%E8%97%E1%89%EF%81%7C09%8C%8E24%93%FA-02%8D%86&KGNO=2965&FINO=3359&UNID=K_R06092400021",
    xPostUrl: "https://x.com/lsvsince2026/status/2121057069688402014"
  },
  {
    id: "22",
    cardNo: "紹介カード 22",
    name: "すとう博文",
    kana: "すとう ひろふみ",
    party: "自民党",
    partyCategory: "自民党",
    chamber: "地方議会",
    title: "自民党・千葉市議会議員（美浜区）",
    divisionText: "千葉県・千葉市｜千葉市議会",
    prefecture: "千葉県",
    region: "千葉県",
    questionDate: "2026年6月16日",
    questionYear: 2026,
    themes: ["早産児支援", "母乳バンク"],
    summary:
      "弁護士。「子育て現役世代の声」を掲げ、2026年6月の千葉市議会で「リトルベビー支援について」を質問。日置市の例を挙げて搾乳機・母乳パックの購入補助を求めた。",
    sourceTitle: "千葉市議会 会議録",
    sourceUrl: "https://www.city.chiba.chiba.dbsr.jp/850200?Template=document&Id=7068#one:185",
    xPostUrl: "https://x.com/lsvsince2026/status/2121237672731803743"
  },
  {
    id: "23",
    cardNo: "紹介カード 23",
    name: "諸井菜々子",
    kana: "もろい ななこ",
    party: "新しい豊橋",
    partyCategory: "無所属",
    chamber: "地方議会",
    title: "新しい豊橋・豊橋市議会議員",
    divisionText: "愛知県・豊橋市｜豊橋市議会",
    prefecture: "愛知県",
    region: "愛知県",
    questionDate: "2023年12月4日",
    questionYear: 2023,
    themes: ["付き添い入院"],
    summary:
      "総合病院で10年働いた経験から、2023年12月に豊橋市議会で市民病院の付き添い入院の負担軽減を質問。簡易ベッドの無償貸出を確認し、保護者への食事提供を改めて求めた。",
    sourceTitle: "豊橋市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/toyohashi/SpMinuteView.html?power_user=false&tenant_id=410&council_id=1332&schedule_id=2&view_years=2023",
    xPostUrl: "https://x.com/lsvsince2026/status/2121951169551778287"
  },
  {
    id: "24",
    cardNo: "紹介カード 24",
    name: "盛月寿美",
    kana: "もりづき すみ",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・静岡県議会議員（静岡市清水区）",
    divisionText: "静岡県・静岡市｜静岡県議会",
    prefecture: "静岡県",
    region: "静岡県",
    questionDate: "2022年9月28日",
    questionYear: 2022,
    themes: ["母乳バンク"],
    summary:
      "2022年9月の代表質問で「母乳バンクの普及に向けた取組について」を質問。県内初のドナー登録機関を立ち上げたお母さんの思いを紹介し、ポスターの配布や登録機関とNICUとの連携を求めた。",
    sourceTitle: "静岡県議会 会議録",
    sourceUrl: "https://www2.pref.shizuoka.jp/all/ggiji.nsf/ffb2b708c352ce3449256854002dd512/aa768cd1592c527f49258904007f2cd5?OpenDocument",
    xPostUrl: "https://x.com/lsvsince2026/status/2121400385588068402"
  },
  {
    id: "25",
    cardNo: "紹介カード 25",
    name: "加藤たかし",
    kana: "かとう たかし",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・愛知県議会議員（豊田市）",
    divisionText: "愛知県・豊田市｜愛知県議会",
    prefecture: "愛知県",
    region: "愛知県",
    questionDate: "2023年3月3日",
    questionYear: 2023,
    themes: ["母乳バンク"],
    summary:
      "ドナーミルクを愛知県議会で初めて取り上げた議員。2023年3月に「もっと早く知ることができればよかった」という親の声を紹介し、母子手帳交付時の情報提供などを求めた。2026年11月には利用拡大を求める意見書が県議会で可決された。",
    sourceTitle: "愛知県議会 会議録",
    sourceUrl: "https://www.pref.aichi.dbsr.jp/index.php/816453?Template=document&Id=2527#all:25",
    xPostUrl: "https://x.com/lsvsince2026/status/2121416608136720426"
  },
  {
    id: "26",
    cardNo: "紹介カード 26",
    name: "藤野英明",
    kana: "ふじの ひであき",
    party: "無所属",
    partyCategory: "無所属",
    chamber: "地方議会",
    title: "無所属・横須賀市議会議員",
    divisionText: "神奈川県・横須賀市｜横須賀市議会",
    prefecture: "神奈川県",
    region: "神奈川県",
    questionDate: "2023年9月19日",
    questionYear: 2023,
    themes: ["早産児支援", "母乳バンク"],
    summary:
      "精神保健福祉士でケアラーとして生きてきた市議6期目。2022年に市立病院NICUでのドナーミルク提供を求め、その後うわまち病院がドナーミルク提供施設・ドナー登録施設になった。2023年にはリトルベビーハンドブックの周知と、母子健康手帳への母乳バンク啓発チラシの挟み込みを求めた。",
    sourceTitle: "横須賀市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/yokosuka/SpMinuteView.html?&council_id=1626&schedule_id=5",
    xPostUrl: "https://x.com/lsvsince2026/status/2121988260872560835"
  },
  {
    id: "27",
    cardNo: "紹介カード 27",
    name: "鳥海直樹",
    kana: "とりうみ なおき",
    party: "無所属",
    partyCategory: "無所属",
    chamber: "地方議会",
    title: "無所属・成田市議会議員（会派は政友クラブ）",
    divisionText: "千葉県・成田市｜成田市議会",
    prefecture: "千葉県",
    region: "千葉県",
    questionDate: "2022年6月8日",
    questionYear: 2022,
    themes: ["早産児支援"],
    summary:
      "2022年6月、早産児と低出生体重児の現状とケア体制、成田赤十字病院のNICU、世界早産児デーの啓発を質問。市は病院と連携した啓発の検討を答え、その年の11月に懸垂幕などの啓発が始まった。毎年、世界早産児デーの時期にNICUを訪問している。",
    sourceTitle: "成田市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/narita/SpMinuteView.html?power_user=false&tenant_id=183&council_id=642&schedule_id=4&view_years=2022",
    xPostUrl: "https://x.com/lsvsince2026/status/2122489693103358150"
  },
  {
    id: "28",
    cardNo: "紹介カード 28",
    name: "月森たくや",
    kana: "つきもり たくや",
    party: "公明党",
    partyCategory: "公明党",
    chamber: "地方議会",
    title: "公明党・名古屋市会議員（中川区）",
    divisionText: "愛知県・名古屋市｜名古屋市議会",
    prefecture: "愛知県",
    region: "愛知県",
    questionDate: "2025年11月21日",
    questionYear: 2025,
    themes: ["母乳バンク"],
    summary:
      "2025年11月、名古屋市内にドナー登録施設がない現状を挙げ、ドナーミルクの助成と西部医療センターでのドナー登録検査を求めた。その後2026年、同センターでドナー登録が始まった。",
    sourceTitle: "名古屋市議会 会議録",
    sourceUrl: "https://ssp.kaigiroku.net/tenant/nagoya/SpMinuteView.html?power_user=false&tenant_id=207&council_id=660&schedule_id=3&view_years=2025",
    xPostUrl: "https://x.com/lsvsince2026/status/2122522853379867079"
  }
];

const PREFECTURE_ORDER = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const registeredPrefectures = PREFECTURE_ORDER.filter((pref) =>
  POLITICIANS_DATA.some((p) => p.chamber === "地方議会" && p.prefecture === pref)
);

export const REGIONS = [
  "すべて",
  "国会",
  ...registeredPrefectures
];

export const THEMES = [
  "すべて",
  "早産児支援",
  "母乳バンク",
  "付き添い入院"
];

export const PARTIES = [
  "すべて",
  "自民党",
  "公明党",
  "立憲民主党",
  "日本維新の会",
  "参政党",
  "都民ファーストの会",
  "チームみらい",
  "無所属"
];

export const YEARS = [
  "すべて",
  "2026年",
  "2025年",
  "2024年",
  "2023年",
  "2022年以前"
];

export const SORT_OPTIONS = [
  { value: "card_asc", label: "紹介カード番号順（01〜28）" },
  { value: "date_desc", label: "質問日：新しい順" },
  { value: "date_asc", label: "質問日：古い順" },
  { value: "name_asc", label: "議員名（五十音順）" }
];