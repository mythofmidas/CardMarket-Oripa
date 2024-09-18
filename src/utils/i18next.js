// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        //admin panel
        welcome: "Welcome to our application",
        dashboard: "Dashboard",
        administrators: "Administrators",
        admin: "admin",
        users: "Users",
        category: "Category",
        prize: "Prize",
        gacha: "Gacha",
        point: "Point",
        delivery: "Delivery",
        notion: "Notion",
        userterms: "Userterms",
        no: "No",
        name: "Name",
        email: "Email",
        password: "Password",
        add: "Add",
        update: "Update",
        action: "Action",
        description: "Description",
        logout: "Log Out",

        //navbar
        welcome: "Welcome",
        admin: "Admin",
        my: "My",
        profile: "Profile",
        delivery: "Delivery",
        cards: "Cards",
        //administrator page
        items: "Items",
        authority: "Authority",
        read: "Read",
        write: "Write",
        save: "Save",
        //userdetail page
        address: "Address",
        city: "City",
        country: "Country",
        postal_code: "Postal Code",
        usage: "Usage",
        user_information: "User Information",
        point_log: "Point Log",
        obtained_cards: "Obtained Cards",

        //prize page
        rarity: "Rarity",
        cashback: "Cashback",
        image: "Image",
        status: "Status",
        set: "set",
        Grade: "Grade",
        first: "First Prize",
        second: "Second Prize",
        third: "Third Prize",
        fourth: "Fourth Prize",
        //gacha page
        price: "price",
        total: "Total",
        number: "Number",
        created: "Created",
        date: "Date",
        detail: "Detail",
        release: "Release",
        unrelease: "Unrelease",
        delete: "Delete",
        //gacha detail page
        detail: "Detail",
        list: "List",
        last: "Last",
        set: "Set",
        set_CSV: "Set Prizes from CSV file",
        upload: "Upload",
        set_registered_prize: "Set Prizes from registered Prizes",
        load_prizes: "Load Registered Prizes",
        set_as_lastPrize: "Set as LastPrize",

        //point page
        amount: "Amount",
        price: "Price",
        //delivery
        username: "UserName",
        status: "Status",
        delivering: "Delivering",
        pending: "Pending",
        //user panel
        all: "All",
        draw: "Draw",
        draws: "Draws",
        user: "User",
        guide: "Guide",
        aboutus: "About Us",
        blog: "Blog",
        license: "License",
        return: "Return",
        consume: "Consume",
        continue: "Continue",
        //login/register
        register: "Register",
        login: "Login",
        sign_in: "Sign In",
        sign_up: "Sign Up",
        with: "with",
        new: "New",
        create_account: "Create An Account",
        forgot: "Forgot",
        remember_me: "Remember Me",
        strength: "Strength",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
        policy_agree: "I agree privacy policy",
        //notification

        nocard: "There is no card.",
        nogacha: "There is no Gacha.",
        noprize: "There is no Prize.",
        nolastprize: "There is no last prize.",
        nopointlog: "There is no Point log.",

        //confirm
        confirm: "Are you sure?",
        del_confirm: "Once deleted, it can't be undone.",
        //others
        cancel: "Cancel",
        // Add more translations here
      },
    },
    jp: {
      translation: {
        welcome: "私たちのアプリケーションへようこそ",
        //sidebar
        dashboard: "ダッシュボード",
        administrators: "管理者",
        admin: "管理者",
        users: "ユーザー",
        category: "カテゴリー",
        prize: "賞品",
        gacha: "ガチャ",
        point: "ポイント",
        delivery: "配送",
        notion: "ノーション",
        userterms: "利用規約",
        no: "番号",
        name: "名前",
        email: "メールアドレス",
        password: "パスワード",
        add: "追加",
        update: "アップデート",
        action: "アクション",
        description: "説明",
        //navbar
        welcome: "いらっしゃいませ",
        admin: "管理パネル",
        my: "私の",
        profile: "プロフィール",
        delivery: "配達",
        logout: "ログアウト",
        cards: "カード",
        //administrator page
        items: "項目",
        authority: "権限",
        read: "読む",
        write: "書く",
        save: "保存",
        //userdetail page
        address: "住所",
        city: "市",
        country: "国",
        postal_code: "郵便番号",
        usage: "使い",
        user_information: "ユーザー情報",
        point_log: "ポイントログ",
        obtained_cards: "入手したカード",
        // prize page
        rarity: "レアリティ",
        cashback: "キャッシュバック",
        image: "画像",
        status: "ステータス",
        set: "設定",
        Grade: "グレード",
        first: "一等賞",
        second: "二等賞",
        third: "三等賞",
        fourth: "四等賞",
        // gacha page
        price: "価格",
        total: "合計",
        number: "番号",
        created: "作成日",
        date: "日付",
        detail: "詳細",
        release: "リリース",
        unrelease: "リリース中止",
        delete: "削除",
        //gacha detail page
        detail: "詳細",
        list: "リスト",
        last: "最後",
        set: "セット",
        set_CSV: "CSVファイルから賞品を設定",
        upload: "アップロード",
        set_registered_prize: "登録した賞品から賞品を設定します。",
        load_prizes: "登録した賞品を読み込む",
        set_as_lastPrize: "最後の賞品として設定",
        // point page
        amount: "数量",
        price: "価格",
        // delivery
        username: "ユーザー名",
        status: "ステータス",
        delivering: "配送中",
        pending: "保留中",
        // user panel
        All: "すべて",
        draw: "抽選",
        draws: "抽選",
        user: "ユーザー",
        guide: "ガイド",
        aboutus: "私たちについて",
        blog: "ブログ",
        license: "ライセンス",
        return: "帰り",
        consume: "消費",
        continue: "続ける",

        // login
        register: "登録",
        login: "サインイン",
        sign_in: "サインイン",
        sign_up: "サインアップ",
        with: "以て",
        new: "新規",
        create_account: "アカウントを作成する",
        forgot: "忘れた",
        remember_me: "私を覚えておいて",
        strength: "強さ",
        weak: "弱い",
        medium: "中程度",
        strong: "強い",
        policy_agree: "プライバシーポリシーに同意します",

        //notification
        nocard: "カードはありません。",
        nogacha: "ガチャはありません。",
        noprize: "賞品はありません。",
        nolastprize: "最後の賞品はありません。",
        nopointlog: "ポイントログはありません。",

        //confirm
        confirm: "本気ですか？",
        del_confirm: "一度削除すると元に戻せません。",
        //others
        cancel: "キャンセル",
        // Add more translations here
      },
    },
    // Add more languages here
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
