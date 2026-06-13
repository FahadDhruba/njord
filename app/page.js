'use client';

import { useState } from 'react';

const TAB_ACTIVE = 'border-b-2 border-slate-900 text-slate-900 font-medium pb-2 text-sm';
const TAB_IDLE = 'border-b-2 border-transparent text-slate-400 hover:text-slate-600 pb-2 text-sm cursor-pointer';

const CODE_BLOCK = 'bg-slate-950 text-slate-100 rounded-xl text-sm font-mono p-5 overflow-x-auto leading-relaxed';

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const MethodBadge = ({ method }) => {
  const map = { GET: 'emerald', POST: 'blue', PUT: 'amber', DELETE: 'red' };
  return <Badge color={map[method] || 'slate'}>{method}</Badge>;
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
};

const CodePanel = ({ code }) => (
  <div className={CODE_BLOCK + ' relative'}>
    <div className="absolute top-3 right-4">
      <CopyButton text={code} />
    </div>
    <pre className="whitespace-pre-wrap">{code}</pre>
  </div>
);

const ParamRow = ({ name, type, required, children }) => (
  <div className="py-3 border-b border-slate-100 last:border-0 grid grid-cols-[180px_1fr] gap-4 items-start">
    <div className="flex flex-col gap-1">
      <span className="font-mono text-sm text-slate-900">{name}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-400">{type}</span>
        {required && <Badge color="red">required</Badge>}
      </div>
    </div>
    <p className="text-sm text-slate-600 mt-0.5">{children}</p>
  </div>
);

const ResponseRow = ({ code, label, color }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <span className={`font-mono text-sm font-medium w-10 ${color}`}>{code}</span>
    <span className="text-sm text-slate-600">{label}</span>
  </div>
);

function EndpointCard({ method, path, title, description, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <MethodBadge method={method} />
        <code className="font-mono text-sm text-slate-700 flex-1">{path}</code>
        <span className="text-slate-500 text-sm hidden sm:block">{title}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 space-y-6">
          <p className="text-slate-600 text-sm">{description}</p>
          {children}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{label}</h4>
      {children}
    </div>
  );
}

const startCurl = `curl -X POST https://your-domain.com/api/v1/start \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectName": "my_project",
    "email": "you@example.com"
  }'`;

const startSuccess = `{
  "status": "success",
  "message": "Season created successfully.",
  "token": "3f1d2e9a...64chars",
  "projectName": "my_project"
}`;

const startError400 = `{
  "status": "error",
  "message": "Missing required fields. It needs projectName & email."
}`;

const routeGetCurl = `curl -X GET https://your-domain.com/api/v1/route/my_project/users \\
  -H "x-njord-token: 3f1d2e9a...64chars"`;

const routeGetSuccess = `{
  "status": "success",
  "message": "Documents fetched successfully.",
  "project": "my_project/users",
  "documents": [
    { "_id": "...", "name": "Alice", "role": "admin" }
  ]
}`;

const routePostCurl = `curl -X POST https://your-domain.com/api/v1/route/my_project/users \\
  -H "Content-Type: application/json" \\
  -H "x-njord-token: 3f1d2e9a...64chars" \\
  -d '{
    "name": "Alice",
    "role": "admin"
  }'`;

const routePostSuccess = `{
  "status": "success",
  "message": "Document created successfully.",
  "project": "my_project/users"
}`;

const authError = `{
  "status": "error",
  "message": "Missing access token. Send x-njord-token."
}`;

export default function NjordDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-semibold tracking-tight text-slate-900">Njord</span>
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-sm text-slate-500">API Reference</span>
          </div>
          <Badge color="slate">v1</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        {/* Hero */}
        <div className="space-y-4 border-b border-slate-100 pb-12">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">API Reference</h1>
          <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
            Njord is a lightweight data API. Register a project season to get an access token,
            then read and write documents to any sub-collection under that project.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">Base URL: <code className="font-mono text-slate-600">https://your-domain.com/api/v1</code></span>
          </div>
        </div>

        {/* Authentication */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Authentication</h2>
            <p className="text-slate-500 text-sm">
              All data endpoints require a project token sent via a request header.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex gap-3">
            <span className="text-amber-500 mt-0.5">⚠</span>
            <p className="text-sm text-amber-800">
              Keep your token private. It grants full read/write access to your project data.
              Tokens are <strong>64-character hex strings</strong> generated at season creation.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Request header</span>
            </div>
            <div className="px-5 py-4">
              <code className="font-mono text-sm text-slate-700">x-njord-token: &lt;your-64-char-token&gt;</code>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Endpoints</h2>

          {/* POST /start */}
          <EndpointCard
            method="POST"
            path="/api/v1/start"
            title="Create a season"
            description="Registers a new project season and returns a unique 64-character access token. Each project name can only be registered once."
          >
            <Section label="Request body">
              <div className="bg-white border border-slate-200 rounded-xl px-5 divide-y divide-slate-100">
                <ParamRow name="projectName" type="string" required>
                  Unique identifier for your project. Only letters, numbers, and underscores are
                  allowed — no spaces or special characters. Normalised to lowercase.
                </ParamRow>
                <ParamRow name="email" type="string" required>
                  Your email address. Stored with the season record.
                </ParamRow>
              </div>
            </Section>

            <Section label="Example request">
              <CodePanel code={startCurl} />
            </Section>

            <Section label="Responses">
              <div className="bg-white border border-slate-200 rounded-xl px-5">
                <ResponseRow code="201" color="text-emerald-600" label="Season created — returns token and normalised projectName." />
                <ResponseRow code="400" color="text-amber-600" label="Missing fields, invalid project name, or name already taken." />
                <ResponseRow code="500" color="text-red-500" label="Internal server error." />
              </div>
            </Section>

            <Section label="201 response">
              <CodePanel code={startSuccess} />
            </Section>

            <Section label="400 response">
              <CodePanel code={startError400} />
            </Section>
          </EndpointCard>

          {/* GET /route/[...project] */}
          <EndpointCard
            method="GET"
            path="/api/v1/route/[project]/[...sub]"
            title="Fetch documents"
            description="Returns all documents from the collection addressed by the URL path. The first segment must match your project name, and any additional segments address sub-collections (stored as dot-separated MongoDB collections)."
          >
            <Section label="URL structure">
              <div className="bg-white border border-slate-200 rounded-xl px-5 divide-y divide-slate-100">
                <ParamRow name="project" type="path segment" required>
                  Must match the <code className="font-mono text-xs">projectName</code> your token was issued for.
                </ParamRow>
                <ParamRow name="...sub" type="path segments">
                  Optional sub-collection path. <code className="font-mono text-xs">/my_project/users/admins</code> reads from collection{' '}
                  <code className="font-mono text-xs">my_project.users.admins</code>.
                </ParamRow>
              </div>
            </Section>

            <Section label="Required header">
              <div className="bg-white border border-slate-200 rounded-xl px-5">
                <ParamRow name="x-njord-token" type="string" required>
                  Your 64-character project token.
                </ParamRow>
              </div>
            </Section>

            <Section label="Example request">
              <CodePanel code={routeGetCurl} />
            </Section>

            <Section label="Responses">
              <div className="bg-white border border-slate-200 rounded-xl px-5">
                <ResponseRow code="200" color="text-emerald-600" label="Returns project label and array of documents." />
                <ResponseRow code="401" color="text-amber-600" label="Missing x-njord-token header." />
                <ResponseRow code="403" color="text-red-500" label="Invalid token, or token does not match this project." />
                <ResponseRow code="500" color="text-red-500" label="Internal server error." />
              </div>
            </Section>

            <Section label="200 response">
              <CodePanel code={routeGetSuccess} />
            </Section>
          </EndpointCard>

          {/* POST /route/[...project] */}
          <EndpointCard
            method="POST"
            path="/api/v1/route/[project]/[...sub]"
            title="Create a document"
            description="Inserts a new document into the collection addressed by the URL path. The token field is automatically stripped from the request body before insertion."
          >
            <Section label="URL structure">
              <div className="bg-white border border-slate-200 rounded-xl px-5 divide-y divide-slate-100">
                <ParamRow name="project" type="path segment" required>
                  Must match the <code className="font-mono text-xs">projectName</code> your token was issued for.
                </ParamRow>
                <ParamRow name="...sub" type="path segments">
                  Optional sub-collection path. Same dot-notation mapping as GET.
                </ParamRow>
              </div>
            </Section>

            <Section label="Required header">
              <div className="bg-white border border-slate-200 rounded-xl px-5">
                <ParamRow name="x-njord-token" type="string" required>
                  Your 64-character project token.
                </ParamRow>
              </div>
            </Section>

            <Section label="Request body">
              <p className="text-sm text-slate-500">
                Any valid JSON object. The <code className="font-mono text-xs">token</code> field is always removed before saving. MongoDB assigns an <code className="font-mono text-xs">_id</code> automatically.
              </p>
            </Section>

            <Section label="Example request">
              <CodePanel code={routePostCurl} />
            </Section>

            <Section label="Responses">
              <div className="bg-white border border-slate-200 rounded-xl px-5">
                <ResponseRow code="201" color="text-emerald-600" label="Document inserted. Returns project label." />
                <ResponseRow code="401" color="text-amber-600" label="Missing x-njord-token header." />
                <ResponseRow code="403" color="text-red-500" label="Invalid token, or token does not match this project." />
                <ResponseRow code="500" color="text-red-500" label="Internal server error." />
              </div>
            </Section>

            <Section label="201 response">
              <CodePanel code={routePostSuccess} />
            </Section>

            <Section label="401/403 response">
              <CodePanel code={authError} />
            </Section>
          </EndpointCard>
        </section>

        {/* Error format */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Error format</h2>
          <p className="text-sm text-slate-500">All errors follow the same shape:</p>
          <CodePanel code={`{
  "status": "error",
  "message": "Human-readable description of what went wrong."
}`} />
          <p className="text-sm text-slate-500">
            5xx responses also include an <code className="font-mono text-xs">error</code> field with the raw exception message.
          </p>
        </section>

        {/* Rules */}
        <section className="space-y-5 border-t border-slate-100 pt-12">
          <h2 className="text-xl font-semibold text-slate-900">Project name rules</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            {[
              'Only letters (a–z, A–Z), digits (0–9), and underscores (_) are allowed.',
              'Names are normalised to lowercase before storage.',
              'Names must be unique across all seasons.',
              'Spaces and special characters are rejected with a 400 error.',
            ].map((r, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 pt-8 text-xs text-slate-400 flex justify-between items-center">
          <span>Njord API — v1</span>
          <span>Built with Next.js App Router</span>
        </footer>
      </main>
    </div>
  );
}