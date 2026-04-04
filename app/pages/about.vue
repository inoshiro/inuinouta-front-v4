<template>
  <div class="max-w-2xl">
    <h1 class="mb-8 text-xl font-bold text-gray-50">サイト情報</h1>

    <!-- About this site -->
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        <FontAwesomeIcon :icon="['fas', 'music']" class="mr-2 h-4 w-4 text-gray-400" />
        いぬいのうたについて
      </h2>
      <div class="space-y-3 text-sm leading-relaxed">
        <p class="text-gray-400">
          「いぬいのうた」は、VTuber・戌亥とこさんの歌動画を検索・視聴できるファンサイトです。
          楽曲や歌枠配信の検索、プレイリストの作成など、様々な機能をお使いいただけます。
        </p>
        <p class="text-gray-400">
          動画再生にはYouTube公式の埋め込みプレイヤーを使用しているため、再生数などは元動画に正しく反映されます。
        </p>
        <p class="text-gray-400">
          当サイトは、いのしろ（<a
            href="https://x.com/ino463"
            target="_blank"
            rel="noopener noreferrer"
            class="text-selected-text hover:underline"
            >@ino463</a
          >）個人が開発・運営しています。登録されている動画や曲情報には漏れがある可能性がありますので、予めご了承ください。
        </p>
      </div>
    </section>

    <!-- Features -->
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        <FontAwesomeIcon :icon="['fas', 'star']" class="mr-2 h-4 w-4 text-gray-400" />
        主な機能
      </h2>
      <ul class="list-inside list-disc space-y-2 text-sm text-gray-400">
        <li>楽曲・歌枠配信の検索と視聴</li>
        <li>アーティスト、楽曲タイプ、動画タイプでのフィルタリング</li>
        <li>お気に入りプレイリストの作成・管理</li>
        <li>連続再生機能（キュー管理）</li>
      </ul>
    </section>

    <!-- Tech stack -->
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        <FontAwesomeIcon :icon="['fas', 'gear']" class="mr-2 h-4 w-4 text-gray-400" />
        技術スタック
      </h2>
      <div class="space-y-2 text-sm">
        <div>
          <span class="text-gray-400">フロントエンド:</span>
          <span class="ml-2 text-gray-50">Nuxt 4, Vue 3, TypeScript, Tailwind CSS</span>
        </div>
        <div>
          <span class="text-gray-400">バックエンド:</span>
          <span class="ml-2 text-gray-50">Django, Python</span>
        </div>
      </div>
    </section>

    <!-- Related links -->
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        <FontAwesomeIcon :icon="['fas', 'link']" class="mr-2 h-4 w-4 text-gray-400" />
        関連リンク
      </h2>
      <div class="space-y-2 text-sm">
        <a
          href="https://www.youtube.com/@InuiToko"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-selected-text hover:underline"
        >
          <FontAwesomeIcon :icon="['fab', 'youtube']" class="h-4 w-4" />
          <span>戌亥とこ YouTubeチャンネル</span>
        </a>
        <a
          href="https://twitter.com/inui_toko"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 text-selected-text hover:underline"
        >
          <FontAwesomeIcon :icon="['fab', 'x-twitter']" class="h-4 w-4" />
          <span>戌亥とこ Twitter</span>
        </a>
      </div>
    </section>

    <!-- Contact -->
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        <FontAwesomeIcon :icon="['fas', 'envelope']" class="mr-2 h-4 w-4 text-gray-400" />
        連絡先
      </h2>
      <div class="space-y-2 text-sm">
        <div>
          <span class="text-gray-400">Twitter:</span>
          <a
            href="https://x.com/inui_no_uta"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-2 text-selected-text hover:underline"
          >
            @inui_no_uta
          </a>
        </div>
        <div>
          <span class="text-gray-400">マシュマロ:</span>
          <a
            href="https://marshmallow-qa.com/inui_no_uta"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-2 text-selected-text hover:underline"
          >
            marshmallow-qa.com/inui_no_uta
          </a>
        </div>
        <div>
          <span class="text-gray-400">Wavebox:</span>
          <a
            href="https://wavebox.me/wave/4v3755rdt2e2otd5/"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-2 text-selected-text hover:underline"
          >
            wavebox.me/wave/4v3755rdt2e2otd5
          </a>
        </div>
      </div>
    </section>

    <!-- Analytics (commented out: not yet implemented) -->
    <!--
    <section class="mb-8">
      <h2 class="mb-3 border-b border-border-default pb-2 text-base font-bold text-gray-50">
        📊 アクセス解析について
      </h2>
      <div class="space-y-3 text-sm leading-relaxed">
        <p class="text-gray-400">
          当サイトでは、サービス改善のためGoogle Analytics 4を使用してアクセス解析を行っています。
        </p>
        <p class="text-gray-400">
          収集される情報には、ページビュー、楽曲の再生・検索履歴、プレイリスト操作などの統計データが含まれます。これらの情報は個人を特定するものではなく、サイトの機能改善や利用傾向の把握のみに使用されます。
        </p>
        <p class="text-gray-400">
          詳しくは
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            class="text-selected-text hover:underline"
            >Googleプライバシーポリシー</a
          >をご確認ください。
        </p>
      </div>
    </section>
    -->

    <!-- Footer note -->
    <section class="border-t border-border-default pt-4">
      <p class="text-xs text-gray-400">
        ※ このサイトは非公式のファンサイトです。<br />
        ※ 動画コンテンツの著作権は各権利者に帰属します。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'サイト情報 | いぬいのうた' })
</script>
